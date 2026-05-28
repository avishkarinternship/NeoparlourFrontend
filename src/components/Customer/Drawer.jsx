import React from 'react';

const Drawer = ({ isOpen, onClose, setCurrentView }) => {
    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            
            {/* Dark Backdrop overlay - Click to close */}
            <div 
                onClick={onClose} 
                className="absolute inset-0 bg-black/20 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer Panel */}
            <div className={`absolute right-0 top-0 h-full w-[360px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                
                {/* User Info Header Section */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-100 relative">
                    {/* Close button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    {/* Avatar Profile Image */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200">
                        <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                            alt="User Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Name and Phone */}
                    <div>
                        <h4 className="font-bold text-gray-900 text-base tracking-tight">Prowin wadkar</h4>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium tracking-wide">+91 70******12</p>
                    </div>
                </div>

                {/* Navigation Actions List */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50/40">
                    
                    {/* Upper Action Group */}
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                        {[
                            { label: 'Profile', icon: (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )},
                            { 
                                label: 'About Us', 
                                icon: (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ), 
                                action: () => setCurrentView('about') 
                            },
                            { label: 'Support', icon: (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )},
                            { label: 'My Bookings', icon: (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )},
                        ].map((item, index, arr) => (
                            <button 
                                key={item.label}
                                onClick={() => {
                                    if (item.action) item.action();
                                    onClose();
                                }}
                                className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 transition-colors text-left ${index !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    {item.icon}
                                    <span className="text-sm font-semibold text-gray-700 tracking-wide">{item.label}</span>
                                </div>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>

                    {/* Lower Account Security Group */}
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                        {[
                            { label: 'Change Password', icon: (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            )},
                            { label: 'LOGOUT', labelStyle: "text-gray-600 font-bold", icon: (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            )},
                        ].map((item, index, arr) => (
                            <button 
                                key={item.label}
                                onClick={onClose}
                                className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 transition-colors text-left ${index !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    {item.icon}
                                    <span className={`text-sm font-semibold tracking-wide ${item.labelStyle || 'text-gray-700'}`}>{item.label}</span>
                                </div>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Drawer;