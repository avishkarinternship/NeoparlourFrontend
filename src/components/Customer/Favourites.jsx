import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { switchTenant, fetchDefaultSalon, setDefaultSalon } from '../../redux/slices/customerSlice';
import toast from 'react-hot-toast';
import { Heart, Trash2, MapPin, Star, Clock, ChevronRight, Crown } from 'lucide-react';
import SEOFooter from '../common/SEOFooter';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const Favourites = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, defaultSalon } = useSelector((state) => state.customer);

    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [switchingId, setSwitchingId] = useState(null);
    const [settingDefaultId, setSettingDefaultId] = useState(null);

    // Fetch all favourites
    const fetchFavourites = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/customer/favourites');
            setFavourites(response.data || []);
        } catch (error) {
            console.error('Error loading favourites:', error);
            toast.error(error.response?.data?.message || 'Failed to load favourites', toastStyle);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavourites();
        dispatch(fetchDefaultSalon());
    }, [fetchFavourites, dispatch]);

    // Remove single favourite
    const handleRemoveFavourite = async (salonId, salonName, e) => {
        e.stopPropagation();
        const previousFavourites = [...favourites];
        // Optimistic UI update
        setFavourites(favourites.filter(f => f.salonId !== salonId));

        try {
            await axiosInstance.delete(`/customer/favourites/${salonId}`);
            toast.success(`Removed ${salonName} from favourites`, toastStyle);
        } catch (error) {
            console.error('Error removing favourite:', error);
            setFavourites(previousFavourites); // Revert
            toast.error(error.response?.data?.message || 'Failed to remove favourite', toastStyle);
        }
    };

    // Clear all favourites
    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear all your favourite salons?')) return;
        
        const previousFavourites = [...favourites];
        setFavourites([]); // Optimistic update

        try {
            await axiosInstance.delete('/customer/favourites/clear-all');
            toast.success('Cleared all favourite salons', toastStyle);
        } catch (error) {
            console.error('Error clearing favourites:', error);
            setFavourites(previousFavourites); // Revert
            toast.error(error.response?.data?.message || 'Failed to clear favourites', toastStyle);
        }
    };

    // Navigate to Salon
    const handleSalonClick = (fav) => {
        const salonId = fav.salonId;
        const salonName = fav.salonName || 'Selected Salon';
        
        localStorage.setItem('activeSalonId', salonId);
        localStorage.setItem('activeSalonName', salonName);

        if (!token) {
            navigate('/salon');
            return;
        }

        setSwitchingId(salonId);
        const payload = {
            token: token,
            salonId: salonId,
            salonName: salonName
        };

        dispatch(switchTenant(payload))
            .unwrap()
            .then(() => {
                toast.success(`Welcome to ${salonName}`, toastStyle);
                navigate('/salon');
            })
            .catch((err) => {
                const errMsg = String(err).toLowerCase();
                if (errMsg.includes('token') || errMsg.includes('login') || errMsg.includes('unauthorized')) {
                    toast.error('Session expired. Please login again.', toastStyle);
                    navigate('/customer/login');
                } else {
                    // Fallback to navigate anyway
                    navigate('/salon');
                }
            })
            .finally(() => {
                setSwitchingId(null);
            });
    };

    // Set a salon as the default favourite
    const handleSetDefault = async (salonId, salonName, e) => {
        e.stopPropagation();
        setSettingDefaultId(salonId);
        try {
            await dispatch(setDefaultSalon(salonId)).unwrap();
            toast.success(`${salonName} set as your default salon`, toastStyle);
        } catch (error) {
            toast.error(error || 'Failed to set default salon', toastStyle);
        } finally {
            setSettingDefaultId(null);
        }
    };

    const getSalonImageSrc = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const base = axiosInstance.defaults.baseURL || 'https://sb.neoparlour.com/api';
        return `${base}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd] dark:bg-black text-gray-900 dark:text-gray-300 font-sans flex flex-col">
            {/* Header section */}
            <div className="max-w-[1200px] w-full mx-auto px-6 pt-10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-11 h-11 rounded-full bg-white dark:bg-gray-900 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-700 hover:text-[#ff0b01] hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                        title="Go Back"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Favourite Salons</h1>
                        <p className="text-gray-400 font-medium text-sm mt-0.5">Your quick access list of saved salons</p>
                    </div>
                </div>

                {!loading && favourites.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-[#ff0b01] bg-red-50/50 hover:bg-red-50 rounded-xl text-sm font-bold transition-all self-start sm:self-auto shadow-sm cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Content Container */}
            <div className="max-w-[1200px] w-full mx-auto px-6 pb-16 flex-1">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] overflow-hidden p-5 space-y-4 shadow-xs">
                                <div className="h-40 bg-slate-200 dark:bg-gray-800 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-5 bg-slate-200 dark:bg-gray-800 rounded w-44"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded w-28"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : favourites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-[#ff0b01]">
                            <Heart className="w-8 h-8 fill-current" />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">No favourite salons yet</h3>
                        <p className="text-[10px] text-gray-300 mt-1.5 max-w-xs mx-auto">Click the heart button on any salon listing or page to save them here for quick access.</p>
                        <button
                            onClick={() => navigate('/salons')}
                            className="mt-6 px-5 py-2.5 bg-[#ff0b01] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Browse Salons
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {favourites.map((fav) => {
                            const coverImg = getSalonImageSrc(fav.imageUrl);
                            const ratingVal = fav.rating != null ? parseFloat(fav.rating).toFixed(1) : '4.5';
                            const isSwitching = switchingId === fav.salonId;

                            return (
                                <div
                                    key={fav.favouriteId || fav.salonId}
                                    onClick={() => !isSwitching && handleSalonClick(fav)}
                                    className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-gray-200 transition-all duration-200 flex flex-col relative cursor-pointer group ${
                                        isSwitching ? 'opacity-70 pointer-events-none' : ''
                                    }`}
                                >
                                    {/* Switching Loader Overlay */}
                                    {isSwitching && (
                                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xs z-10 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-[#ff0b01] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}

                                    {/* Image Section */}
                                    <div className="h-40 relative bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                        {coverImg ? (
                                            <img
                                                src={coverImg}
                                                alt={fav.salonName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-red-50/20 dark:bg-red-900/10 text-[#ff0b01]">
                                                <svg className="w-12 h-12 stroke-current opacity-30" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                                                    <circle cx="9" cy="17" r="3.5" />
                                                    <circle cx="15" cy="17" r="3.5" />
                                                    <path d="M11.5 14.5L16 5.5" strokeLinecap="round" />
                                                    <path d="M12.5 14.5L8 5.5" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                                        {/* Floating Heart Button */}
                                        <button
                                            onClick={(e) => handleRemoveFavourite(fav.salonId, fav.salonName, e)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs shadow-md border border-gray-150 dark:border-gray-800 flex items-center justify-center text-[#ff0b01] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                                            title="Remove from Favourites"
                                        >
                                            <Heart className="w-4 h-4 fill-current" />
                                        </button>

                                        {/* Floating Rating Badge */}
                                        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs border border-amber-500/20 text-amber-600 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                            <span>{ratingVal}</span>
                                        </div>

                                        {/* Default Salon Badge */}
                                        {(fav.isDefault || defaultSalon?.salonId === fav.salonId) && (
                                            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md z-10">
                                                <Crown className="w-3 h-3" />
                                                <span>Default</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 flex flex-col flex-1 text-left">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-[#ff0b01] transition-colors leading-snug uppercase tracking-tight flex-1 line-clamp-1">
                                                {fav.salonName}
                                            </h3>
                                            {fav.salonCode && (
                                                <span className="text-[8px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 px-1.5 py-0.5 rounded uppercase tracking-widest mt-1">
                                                    {fav.salonCode}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-bold mb-1">
                                            <MapPin className="w-3.5 h-3.5 text-[#ff0b01] shrink-0" />
                                            <span className="truncate">
                                                {[fav.areaName, fav.cityName].filter(Boolean).join(', ') || 'Pune'}
                                            </span>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Added {fav.favouritedAt ? new Date(fav.favouritedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'recently'}
                                            </span>

                                            <div className="flex items-center gap-2.5">
                                                {/* Set as Default Button */}
                                                {!(fav.isDefault || defaultSalon?.salonId === fav.salonId) && (
                                                    <button
                                                        onClick={(e) => handleSetDefault(fav.salonId, fav.salonName, e)}
                                                        disabled={settingDefaultId === fav.salonId}
                                                        className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-lg px-2 py-1 transition-all cursor-pointer disabled:opacity-50"
                                                        title="Set as your default salon"
                                                    >
                                                        <Crown className="w-3 h-3" />
                                                        {settingDefaultId === fav.salonId ? (
                                                            <span className="animate-pulse">Setting...</span>
                                                        ) : (
                                                            <span>Set Default</span>
                                                        )}
                                                    </button>
                                                )}

                                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#ff0b01] group-hover:gap-1.5 transition-all">
                                                    <span>Book Session</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <SEOFooter />
        </div>
    );
};

export default Favourites;

