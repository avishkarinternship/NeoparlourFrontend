import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutCustomerApi } from '../../redux/slices/customerSlice';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../context/DarkModeContext';

const Drawer = ({ isOpen, onClose, onProfileClick, onChangePasswordClick }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, profile, isAuthenticated } = useSelector((state) => state.customer);
    const isLoggedIn = !!(user || profile) && isAuthenticated;
    const { isDark } = useDarkMode();

    const isIncomplete = (name) => {
        const t = (name || '').trim();
        return !t || t.toLowerCase() === 'customer';
    };

    const getDisplayName = () => {
        const rawName = profile?.fullName || user?.name || user?.username || '';
        if (isIncomplete(rawName)) {
            return profile?.mobile || user?.phone || user?.username || 'Profile';
        }
        return rawName;
    };

    const handleLogout = () => {
        dispatch(logoutCustomerApi())
            .unwrap()
            .then(() => {
                toast.success("Logged out successfully");
                onClose();
                navigate('/');
            })
            .catch((err) => {
                toast.error(err || "Logout failed");
            });
    };

    // icon colour adapts to mode
    const iconCls = isDark ? 'text-gray-400' : 'text-gray-400';

    const upperActions = [
        { 
            label: 'Profile', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            action: onProfileClick,
            disabled: !isLoggedIn
        },
        { 
            label: 'About Us', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ), 
            action: () => navigate('/about') 
        },
        { 
            label: 'Support', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            action: () => navigate('/support')
        },
        { 
            label: 'Salons', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            action: () => navigate('/salons')
        },
        { 
            label: 'My Bookings', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            action: () => navigate('/appointments'),
            disabled: !isLoggedIn
        },
        { 
            label: 'My Orders', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            action: () => navigate('/my-orders'),
            disabled: !isLoggedIn
        },
        { 
            label: 'My Salons', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            action: () => navigate('/my-salons'),
            disabled: !isLoggedIn
        },
        { 
            label: 'Favourite Salons', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            ),
            action: () => navigate('/favourites'),
            disabled: !isLoggedIn
        },

        ...(!isLoggedIn ? [
            { 
                label: 'Login', 
                icon: (
                    <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                ),
                action: () => navigate('/customer/login')
            },
            { 
                label: 'Sign Up', 
                icon: (
                    <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                ),
                action: () => navigate('/register')
            }
        ] : []),
    ];

    const lowerActions = [
        { 
            label: 'Change Password', 
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            action: onChangePasswordClick,
            disabled: !isLoggedIn
        },
        { 
            label: 'LOGOUT', 
            labelStyle: isLoggedIn
                ? (isDark ? 'text-gray-300 font-bold' : 'text-gray-600 font-bold')
                : (isDark ? 'text-gray-600 font-bold' : 'text-gray-400 font-bold'),
            icon: (
                <svg className={`w-5 h-5 ${iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            ),
            action: handleLogout,
            disabled: !isLoggedIn
        }
    ];

    // Shared row classes
    const rowBase = `w-full flex items-center justify-between p-4 transition-colors text-left`;
    const rowEnabled = isDark
        ? `${rowBase} bg-gray-900 hover:bg-gray-800 text-gray-200`
        : `${rowBase} bg-white hover:bg-gray-50/80 text-gray-700`;
    const rowDisabled = isDark
        ? `${rowBase} bg-gray-900 opacity-40 cursor-not-allowed text-gray-500`
        : `${rowBase} bg-white opacity-50 cursor-not-allowed text-gray-400`;

    const dividerCls = isDark ? 'border-gray-700' : 'border-gray-100';
    const cardCls = `rounded-xl overflow-hidden shadow-xs border ${isDark ? 'border-gray-700' : 'border-gray-100'}`;

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            
            {/* Dark Backdrop overlay */}
            <div 
                onClick={onClose} 
                className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer Panel */}
            <div className={`absolute right-0 top-0 h-full w-full max-w-[360px] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
                isOpen ? "translate-x-0" : "translate-x-full"
            } ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
                
                {/* User Info Header Section */}
                <div className={`flex items-center gap-4 p-6 border-b relative ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    {/* Close button */}
                    <button 
                        onClick={onClose}
                        className={`absolute top-4 right-4 p-1 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    {/* Name and Phone */}
                    <div className="pt-2">
                        <h4 className={`font-bold text-base tracking-tight leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {isLoggedIn ? getDisplayName() : 'Guest'}
                        </h4>
                        <p className={`text-xs mt-1 font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isLoggedIn ? (profile?.mobile || user?.mobile || user?.phone) : 'Login to experience more'}
                        </p>
                    </div>
                </div>

                {/* Navigation Actions List */}
                <div className={`flex-1 p-5 space-y-4 overflow-y-auto ${isDark ? 'bg-gray-950' : 'bg-gray-50/40'}`}>
                    
                    {/* Upper Action Group */}
                    <div className={cardCls}>
                        {upperActions.map((item, index, arr) => {
                            const isDisabled = item.disabled;
                            return (
                                <button 
                                    key={item.label}
                                    onClick={() => {
                                        if (isDisabled) return;
                                        if (item.action) item.action();
                                        onClose();
                                    }}
                                    className={`${isDisabled ? rowDisabled : rowEnabled} ${index !== arr.length - 1 ? `border-b ${dividerCls}` : ''}`}
                                    disabled={isDisabled}
                                >
                                    <div className="flex items-center gap-3.5">
                                        {item.icon}
                                        <span className={`text-sm font-semibold tracking-wide ${
                                            isDisabled
                                                ? (isDark ? 'text-gray-600' : 'text-gray-400')
                                                : (isDark ? 'text-gray-200' : 'text-gray-700')
                                        }`}>{item.label}</span>
                                    </div>
                                    <svg className={`w-4 h-4 ${isDisabled ? (isDark ? 'text-gray-700' : 'text-gray-300') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            );
                        })}
                    </div>

                    {/* Lower Account Security Group */}
                    {lowerActions.length > 0 && (
                        <div className={cardCls}>
                            {lowerActions.map((item, index, arr) => {
                                const isDisabled = item.disabled;
                                return (
                                    <button 
                                        key={item.label}
                                        onClick={() => {
                                            if (isDisabled) return;
                                            if (item.action) item.action();
                                            onClose();
                                        }}
                                        className={`${isDisabled ? rowDisabled : rowEnabled} ${index !== arr.length - 1 ? `border-b ${dividerCls}` : ''}`}
                                        disabled={isDisabled}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            {item.icon}
                                            <span className={`text-sm font-semibold tracking-wide ${
                                                isDisabled
                                                    ? (isDark ? 'text-gray-600' : 'text-gray-400')
                                                    : item.labelStyle || (isDark ? 'text-gray-200' : 'text-gray-700')
                                            }`}>{item.label}</span>
                                        </div>
                                        <svg className={`w-4 h-4 ${isDisabled ? (isDark ? 'text-gray-700' : 'text-gray-300') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Drawer;