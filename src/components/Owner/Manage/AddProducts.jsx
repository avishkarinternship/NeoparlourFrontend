import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
import { Eye, X, Edit2 } from 'lucide-react';

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

const LazyImage = ({ src, alt, className }) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = React.useRef();

    useEffect(() => {
        let isMounted = true;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && isMounted) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            isMounted = false;
            observer.disconnect();
        };
    }, [src]);

    if (!isIntersecting) {
        return (
            <div ref={ref} className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse w-full h-full bg-gray-150 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <img
            ref={ref}
            src={src}
            alt={alt}
            className={className}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
            }}
        />
    );
};

const AddProducts = () => {
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'view'

    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('manageSidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        const handleToggle = () => {
            const saved = localStorage.getItem('manageSidebarOpen');
            setSidebarOpen(saved !== null ? JSON.parse(saved) : true);
        };
        window.addEventListener('manageSidebarToggle', handleToggle);
        return () => window.removeEventListener('manageSidebarToggle', handleToggle);
    }, []);

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
    const [totalElements, setTotalElements] = useState(0);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [category, setCategory] = useState('');
    const [productType, setProductType] = useState('');
    const [stock, setStock] = useState('');
    const [restockLevel, setRestockLevel] = useState('');
    const [priceError, setPriceError] = useState('');
    const [discountPriceError, setDiscountPriceError] = useState('');

    const [mainImageBase64, setMainImageBase64] = useState('');
    const [additionalImagesBase64, setAdditionalImagesBase64] = useState([]);
    const [existingMainImageUrl, setExistingMainImageUrl] = useState('');
    const [existingAdditionalImageUrls, setExistingAdditionalImageUrls] = useState([]);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(false);

    // View Modal States
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [loadingViewProduct, setLoadingViewProduct] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const handleViewProduct = async (id) => {
        setLoadingViewProduct(true);
        try {
            const response = await axiosInstance.get(`/products/${id}`);
            setSelectedProduct(response.data);
            setActiveImageIndex(0);
            setIsViewModalOpen(true);
        } catch (error) {
            toast.error('Failed to load product details', toastStyle);
        } finally {
            setLoadingViewProduct(false);
        }
    };

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
            setTotalPages(response.data?.page?.totalPages ?? response.data?.totalPages ?? 0);
            setTotalElements(response.data?.page?.totalElements ?? response.data?.totalElements ?? 0);
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

    useEffect(() => {
        if (location.state?.editProductId) {
            handleEdit({ id: location.state.editProductId });
        }
    }, [location.state?.editProductId]);

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

    const handlePriceChange = (value) => {
        let val = value.replace(/[^0-9.]/g, '');
        const occurrences = (val.match(/\./g) || []).length;
        if (occurrences > 1) return;
        const parts = val.split('.');
        if (parts[0].length > 5) return;
        setPrice(val);
        if (parts[0].length === 5) {
            setPriceError("Maximum price limit reached (5 digits)");
        } else {
            setPriceError("");
        }
    };

    const handleDiscountPriceChange = (value) => {
        let val = value.replace(/[^0-9.]/g, '');
        const occurrences = (val.match(/\./g) || []).length;
        if (occurrences > 1) return;
        const parts = val.split('.');
        if (parts[0].length > 5) return;
        setDiscountPrice(val);
        if (parts[0].length === 5) {
            setDiscountPriceError("Maximum price limit reached (5 digits)");
        } else {
            setDiscountPriceError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name?.trim() || !price || stock === '') {
            toast.error("Name, Price and Quantity are required", toastStyle);
            return;
        }

        if (name.trim().length > 255) {
            toast.error("Product name cannot exceed 255 characters", toastStyle);
            return;
        }

        if (description && description.trim().length > 500) {
            toast.error("Description cannot exceed 500 characters", toastStyle);
            return;
        }

        if (category && category.trim().length > 100) {
            toast.error("Category cannot exceed 100 characters", toastStyle);
            return;
        }

        if (productType && productType.trim().length > 100) {
            toast.error("Product type cannot exceed 100 characters", toastStyle);
            return;
        }

        const priceVal = parseFloat(price);
        if (isNaN(priceVal) || priceVal <= 0) {
            toast.error("Price must be greater than 0", toastStyle);
            return;
        }

        if (priceVal >= 100000) {
            toast.error("Price cannot exceed ₹99,999", toastStyle);
            return;
        }

        const discPriceVal = discountPrice ? parseFloat(discountPrice) : null;
        if (discPriceVal !== null) {
            if (isNaN(discPriceVal) || discPriceVal <= 0) {
                toast.error("Discount price must be greater than 0", toastStyle);
                return;
            }
            if (discPriceVal >= priceVal) {
                toast.error("Discount price must be less than original price", toastStyle);
                return;
            }
            if (discPriceVal >= 100000) {
                toast.error("Discount price cannot exceed ₹99,999", toastStyle);
                return;
            }
        }

        const stockVal = parseInt(stock, 10);
        if (isNaN(stockVal) || stockVal < 0) {
            toast.error("Quantity must be 0 or greater", toastStyle);
            return;
        }

        if (restockLevel) {
            const restockVal = parseInt(restockLevel, 10);
            if (isNaN(restockVal) || restockVal < 0) {
                toast.error("Restock level must be 0 or greater", toastStyle);
                return;
            }
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
        setPriceError(''); setDiscountPriceError('');
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
        <>
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white md:border-l md:border-gray-200 overflow-auto">
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
                                        <div>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={rateIcon} alt="Price" className="w-5 h-5 opacity-40" /></div>
                                                <input type="text" inputMode="decimal" value={price} onChange={(e) => handlePriceChange(e.target.value)} placeholder="Original Price *" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" required />
                                            </div>
                                            {priceError && <p className="text-red-500 text-xs mt-1 ml-1">{priceError}</p>}
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={percentageIcon} alt="Discount" className="w-5 h-5 opacity-40" /></div>
                                                <input type="text" inputMode="decimal" value={discountPrice} onChange={(e) => handleDiscountPriceChange(e.target.value)} placeholder="Discount Price (₹)" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
                                            </div>
                                            {discountPriceError && <p className="text-red-500 text-xs mt-1 ml-1">{discountPriceError}</p>}
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
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={productQuantityIcon} alt="Quantity" className="w-5 h-5 opacity-40" /></div>
                                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Quantity *" min="1" step="1" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" required />
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
                                        <div className={`grid gap-6 ${sidebarOpen ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
                                            {products.map(product => {
                                                const imageUrl = getProductImage(product);
                                                const discount = discountPercent(product.price, product.discountPrice);
                                                return (
                                                    <div key={product.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                                        <div 
                                                            onClick={() => handleViewProduct(product.id)}
                                                            className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
                                                        >
                                                            {imageUrl ? (
                                                                <LazyImage src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : (
                                                                <div className="text-center text-gray-400 text-xs px-4">No Image</div>
                                                            )}
                                                            {/* Quick View Hover Overlay */}
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                                <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                                    <Eye className="w-4 h-4 text-[#FF0B01]" />
                                                                    <span>Quick View</span>
                                                                </div>
                                                            </div>
                                                            {discount > 0 && (
                                                                <div className="absolute top-3 right-3 bg-[#FF0B01] text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase shadow-sm z-20">
                                                                    {discount}% OFF
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-4">
                                                            <h5 
                                                                onClick={() => handleViewProduct(product.id)}
                                                                className="text-sm font-semibold line-clamp-2 leading-tight mb-2 h-10 cursor-pointer hover:text-[#FF0B01] transition-colors"
                                                            >
                                                                {product.name}
                                                            </h5>
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    {product.discountPrice ? (
                                                                        <>
                                                                            <span className="font-bold text-red-600">₹{product.discountPrice}</span>
                                                                            <span className="text-xs line-through text-gray-400 ml-2">₹{product.price}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="font-bold text-red-600">₹{product.price}</span>
                                                                    )}
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
                                        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-gray-150">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                PAGE {totalPages === 0 ? 1 : currentPage + 1} OF {totalPages} ({totalElements} TOTAL PRODUCTS)
                                            </span>
                                            <div className="flex items-center space-x-1.5">
                                                <button
                                                    onClick={() => fetchProducts(0)}
                                                    disabled={currentPage <= 0}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                                >
                                                    « First
                                                </button>
                                                <button
                                                    onClick={() => fetchProducts(Math.max(0, currentPage - 1))}
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
                                                    onClick={() => fetchProducts(Math.min(Math.max(0, totalPages - 1), currentPage + 1))}
                                                    disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                                >
                                                    Next ›
                                                </button>
                                                <button
                                                    onClick={() => fetchProducts(Math.max(0, totalPages - 1))}
                                                    disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                                >
                                                    Last »
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                    </div>
                </main>

            {/* View Product Details Modal */}
            {isViewModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 flex flex-col md:flex-row p-6 md:p-8 gap-8 animate-in fade-in zoom-in duration-200">
                        {/* Close button */}
                        <button 
                            onClick={() => setIsViewModalOpen(false)}
                            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-[#FF0B01] flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left Column: Images */}
                        <div className="w-full md:w-1/2 flex flex-col gap-4">
                            {/* Main Preview Container */}
                            <div className="relative w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                                {(() => {
                                    const allUrls = [selectedProduct.imageUrl, ...(selectedProduct.additionalImageUrls || [])].filter(Boolean);
                                    const currentUrl = allUrls[activeImageIndex] || null;
                                    return currentUrl ? (
                                        <img 
                                            src={currentUrl} 
                                            alt={selectedProduct.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-sm">No Image Available</div>
                                    );
                                })()}
                                
                                {selectedProduct.discountPrice && selectedProduct.price && (
                                    <div className="absolute top-4 left-4 bg-[#FF0B01] text-white px-3 py-1 rounded-xl text-xs font-black shadow-md uppercase">
                                        {discountPercent(selectedProduct.price, selectedProduct.discountPrice)}% OFF
                                    </div>
                                )}
                            </div>

                            {/* Additional Images Thumbnails Gallery */}
                            {(() => {
                                const allUrls = [selectedProduct.imageUrl, ...(selectedProduct.additionalImageUrls || [])].filter(Boolean);
                                if (allUrls.length <= 1) return null;
                                return (
                                    <div className="flex gap-2.5 overflow-x-auto py-1 custom-scrollbar">
                                        {allUrls.map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${activeImageIndex === idx ? 'border-[#FF0B01] ring-2 ring-red-500/10' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Right Column: Information */}
                        <div className="w-full md:w-1/2 flex flex-col justify-between">
                            <div className="space-y-5">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.category && (
                                        <span className="text-[10px] bg-red-50 text-[#FF0B01] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                                            {selectedProduct.category}
                                        </span>
                                    )}
                                    {selectedProduct.productType && (
                                        <span className="text-[10px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-slate-100">
                                            {selectedProduct.productType}
                                        </span>
                                    )}
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                                        selectedProduct.active 
                                            ? 'bg-green-50 text-green-700 border border-green-100' 
                                            : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                        {selectedProduct.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Title & Meta */}
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">
                                        {selectedProduct.name}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        ID: NP-{selectedProduct.id} • Added on {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>

                                {/* Pricing Section */}
                                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pricing Details</p>
                                        <div className="flex items-baseline gap-2">
                                            {selectedProduct.discountPrice ? (
                                                <>
                                                    <span className="text-2xl font-black text-[#FF0B01]">₹{selectedProduct.discountPrice}</span>
                                                    <span className="text-sm line-through text-gray-400">₹{selectedProduct.price}</span>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-black text-[#FF0B01]">₹{selectedProduct.price}</span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedProduct.discountPrice && (
                                        <div className="bg-green-50 text-green-700 border border-green-100 rounded-xl px-3 py-2 text-right">
                                            <p className="text-[10px] font-black uppercase tracking-wide">Calculated Savings</p>
                                            <p className="text-sm font-extrabold">Save ₹{(selectedProduct.price - selectedProduct.discountPrice).toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Inventory Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-gray-150 rounded-2xl p-4 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Level</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-extrabold text-gray-900">{selectedProduct.stock} units</span>
                                            {selectedProduct.stock <= (selectedProduct.restockLevel || 10) && (
                                                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                                            )}
                                        </div>
                                        {selectedProduct.stock <= (selectedProduct.restockLevel || 10) ? (
                                            <span className="text-[9px] font-bold text-red-500 uppercase mt-1">Low Stock Warning</span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-green-600 uppercase mt-1">Adequate Stock</span>
                                        )}
                                    </div>

                                    <div className="border border-gray-150 rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Restock Level</p>
                                        <p className="text-xl font-extrabold text-gray-900">{selectedProduct.restockLevel || 10} units</p>
                                        <p className="text-[9px] font-semibold text-gray-400 mt-1">Threshold for low-stock alerts</p>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedProduct.description && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Description</p>
                                        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100 font-medium whitespace-pre-line">
                                            {selectedProduct.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-4 pt-6 border-t border-gray-100 mt-6">
                                <button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleEdit(selectedProduct);
                                    }}
                                    className="flex-1 bg-[#FF0B01] hover:bg-[#d90900] transition text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit Product</span>
                                </button>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="flex-1 border border-gray-300 py-3.5 rounded-2xl font-bold hover:bg-gray-50 text-gray-700 text-xs tracking-wider uppercase transition cursor-pointer"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fetching loading state indicator overlay */}
            {loadingViewProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3 border border-gray-100">
                        <div className="animate-spin h-5 w-5 border-3 border-[#FF0B01] border-t-transparent rounded-full"></div>
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Fetching details...</span>
                    </div>
                </div>
            )}

        </>
    );
};

export default AddProducts;