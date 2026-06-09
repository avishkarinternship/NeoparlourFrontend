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

    // Filter States (for View Products)
    const [filters, setFilters] = useState({
        name: '',
        category: '',
        productType: '',
        active: null,
        minPrice: '',
        maxPrice: '',
        inStock: null,
        keyword: ''
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Form States for Adding Product
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

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

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

    // Load products only when switching to View tab
    useEffect(() => {
        if (activeTab === 'view') {
            fetchProducts(0);
        }
    }, [activeTab]);

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
            await axiosInstance.post('/products', payload);
            toast.success('Product added successfully!', toastStyle);
            resetForm();
            setActiveTab('view');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add product', toastStyle);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const resetForm = () => {
        setName(''); setDescription(''); setPrice(''); setDiscountPrice('');
        setCategory(''); setProductType(''); setStock(''); setRestockLevel('');
        setMainImageBase64(''); setAdditionalImagesBase64([]);
    };

    const handleCancel = resetForm;

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
        setFilters({
            name: '', category: '', productType: '', active: null,
            minPrice: '', maxPrice: '', inStock: null, keyword: ''
        });
        setCurrentPage(0);
    };

    const handleSearch = () => {
        fetchProducts(0);
    };

    // Calculate savings in rupees
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
                        <div className="flex border-b border-gray-200 mb-8">
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === 'add' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Add New Product
                            </button>
                            <button
                                onClick={() => setActiveTab('view')}
                                className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === 'view' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                View Products
                            </button>
                        </div>

                        {/* ==================== ADD PRODUCT TAB ==================== */}
                        {activeTab === 'add' && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <div className="inline-block border-b-2 border-red-600 pb-1 mb-8">
                                    <span className="text-[13px] font-bold uppercase tracking-wider">Add New Product</span>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Main Image */}
                                    <div className="border border-gray-300 rounded-xl p-6">
                                        <p className="text-xs font-bold text-gray-500 mb-3">Main Product Image</p>
                                        <div className="flex gap-6 text-sm mb-4">
                                            <label className="flex items-center gap-2 hover:text-red-600 cursor-pointer">
                                                <img src={openCameraIcon} alt="Camera" className="w-5 h-5" />
                                                <span>Camera</span>
                                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                                            </label>
                                            <label className="flex items-center gap-2 hover:text-red-600 cursor-pointer">
                                                <img src={galleryIcon} alt="Gallery" className="w-5 h-5" />
                                                <span>Gallery</span>
                                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                                            </label>
                                        </div>
                                        {mainImageBase64 && <img src={mainImageBase64} alt="Preview" className="max-h-48 rounded-lg" />}
                                    </div>

                                    {/* Additional Images */}
                                    <div className="border border-gray-300 rounded-xl p-6">
                                        <p className="text-xs font-bold text-gray-500 mb-3">Additional Images ({additionalImagesBase64.length})</p>
                                        <label className="flex items-center gap-2 hover:text-red-600 cursor-pointer text-sm mb-4">
                                            <img src={galleryIcon} alt="Gallery" className="w-5 h-5" />
                                            <span>Add More Images</span>
                                            <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesUpload} className="hidden" />
                                        </label>

                                        {additionalImagesBase64.length > 0 && (
                                            <div className="grid grid-cols-4 gap-3">
                                                {additionalImagesBase64.map((img, index) => (
                                                    <div key={index} className="relative">
                                                        <img src={img} alt={`Addl ${index}`} className="w-full h-24 object-cover rounded-lg" />
                                                        <button type="button" onClick={() => removeAdditionalImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5"><img src={productDetailsIcon} alt="Name" className="w-4 h-4 opacity-70" /></div>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name *" className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" required />
                                        </div>

                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5"><img src={couponCodeIcon} alt="Category" className="w-4 h-4 opacity-70" /></div>
                                            <input type="text" list="categoryList" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                            <datalist id="categoryList">
                                                {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5"><img src={rateIcon} alt="Price" className="w-4 h-4 opacity-70" /></div>
                                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Original Price *" className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" required />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5"><img src={percentageIcon} alt="Discount" className="w-4 h-4 opacity-70" /></div>
                                            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Discount Price (₹)" className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5"><img src={productTypeIcon} alt="Type" className="w-4 h-4 opacity-70" /></div>
                                            <input type="text" list="productTypeList" value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="Product Type" className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                            <datalist id="productTypeList">
                                                {PRODUCT_TYPES.map(type => <option key={type} value={type} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    {/* Savings Display */}
                                    {price && discountPrice && parseFloat(discountPrice) < parseFloat(price) && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                                            <div className="text-green-600 text-xl">💰</div>
                                            <div>
                                                <p className="font-semibold text-green-700">You will save ₹{calculateSavings()}</p>
                                                <p className="text-sm text-green-600">Original: ₹{price} → Discounted: ₹{discountPrice}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5"><img src={productQuantityIcon} alt="Stock" className="w-4 h-4 opacity-70" /></div>
                                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Current Stock *" className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" required />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5"><img src={productQuantityIcon} alt="Restock" className="w-4 h-4 opacity-70" /></div>
                                            <input type="number" value={restockLevel} onChange={(e) => setRestockLevel(e.target.value)} placeholder="Restock Level" className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5"><img src={productDescriptionIcon} alt="Description" className="w-4 h-4 opacity-70" /></div>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product Description" rows="4" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500 resize-none" />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button type="submit" disabled={loadingSubmit} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 disabled:opacity-70">
                                            {loadingSubmit ? 'Adding Product...' : 'Add Product'}
                                        </button>
                                        <button type="button" onClick={handleCancel} className="flex-1 border border-gray-300 py-4 rounded-xl font-bold hover:bg-gray-50">
                                            Cancel
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
                                            <button onClick={resetFilters} className="text-red-600 text-sm font-medium hover:underline">
                                                Reset Filters
                                            </button>
                                            <button
                                                onClick={handleSearch}
                                                className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                    <div key={product.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
                                                        <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : (
                                                                <div className="text-center text-gray-400 text-xs px-4">No Image Present</div>
                                                            )}
                                                        </div>
                                                        <div className="p-4">
                                                            <h5 className="text-sm font-medium line-clamp-2 leading-tight mb-2">{product.name}</h5>
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <span className="font-bold text-red-600">₹{product.price}</span>
                                                                    {product.discountPrice && <span className="text-xs line-through text-gray-400 ml-2">₹{product.discountPrice}</span>}
                                                                </div>
                                                                <span className="text-xs text-gray-500">{product.stock} left</span>
                                                            </div>
                                                            {discount > 0 && <p className="text-xs text-green-600 mt-1">Save ₹{(product.price - product.discountPrice).toFixed(2)} ({discount}%)</p>}
                                                        </div>
                                                        <div className="px-4 pb-4">
                                                            <button
                                                                onClick={() => toggleProductStatus(product.id, product.active)}
                                                                disabled={togglingId === product.id}
                                                                className={`w-full py-2 text-xs font-bold rounded-xl transition-colors ${product.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
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