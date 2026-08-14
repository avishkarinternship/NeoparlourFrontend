import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Phone, Calendar, LogOut, User, Edit2, Save, Sparkles, Mail, MapPin } from 'lucide-react';
import { fetchCustomerProfile, logoutCustomerApi, updateCustomerProfile } from '../../redux/slices/customerSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfilePopup = ({ isOpen, onClose, onChangePasswordClick }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, profile, loading, isAuthenticated } = useSelector((state) => state.customer);

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        gender: '',
        birthdate: '',
        address: ''
    });

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        
        // If DD/MM/YYYY or D/M/YYYY
        const dmyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmyMatch) {
            const [_, d, m, y] = dmyMatch;
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                return d.toISOString().split('T')[0];
            }
        } catch (e) {
            console.error(e);
        }
        return '';
    };

    useEffect(() => {
        if (isOpen && isAuthenticated && user && !profile) {
            const customerId = user.id || user.user?.id;
            if (customerId) {
                dispatch(fetchCustomerProfile(customerId));
            }
        }
    }, [isOpen, isAuthenticated, user, profile, dispatch]);

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                email: profile.email || '',
                mobile: profile.mobile || '',
                gender: profile.gender || '',
                birthdate: formatDateForInput(profile.birthdate || profile.birthDate),
                address: profile.address || ''
            });
        }
    }, [profile, isEditing]);

    // Reset edit state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            const val = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, mobile: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        if (!formData.fullName.trim()) {
            toast.error("Full name is required");
            return;
        }
        if (formData.fullName.trim().length < 2 || formData.fullName.trim().length > 50) {
            toast.error("Full name must be between 2 and 50 characters");
            return;
        }
        if (!formData.mobile) {
            toast.error("Mobile number is required");
            return;
        }
        if (!/^[0-9]{10}$/.test(formData.mobile)) {
            toast.error("Mobile number must be exactly 10 digits");
            return;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Invalid email format");
            return;
        }

        const customerId = user?.id || user?.user?.id || profile?.id;
        if (!customerId) {
            toast.error("User ID not found");
            return;
        }

        const payload = {
            id: customerId,
            profileData: {
                id: customerId,
                fullName: formData.fullName.trim(),
                email: formData.email.trim() || null,
                mobile: formData.mobile,
                gender: formData.gender || null,
                birthdate: formData.birthdate || null,
                birthDate: formData.birthdate || null,
                address: formData.address.trim() || null,
                active: profile?.active !== undefined ? profile.active : true
            }
        };

        setSaving(true);
        dispatch(updateCustomerProfile(payload))
            .unwrap()
            .then(() => {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                dispatch(fetchCustomerProfile(customerId));
            })
            .catch((err) => {
                toast.error(err || "Failed to update profile");
            })
            .finally(() => {
                setSaving(false);
            });
    };

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

    const displayName = getDisplayName();
    const firstInitial = ((displayName.startsWith('+') ? displayName.slice(1) : displayName).charAt(0) || 'P').toUpperCase();

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 transition-all duration-300 font-sans">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 z-10 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer border-0"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Profile Header Block */}
                <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                    {/* Avatar Circle with Badge */}
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-500 to-red-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-red-500/20 border-4 border-white">
                            {firstInitial}
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-xs" title="Account Active">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{displayName}</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{profile?.mobile || user?.mobile || user?.phone || 'Customer'}</p>
                    
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="mt-3 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all duration-200 cursor-pointer border-0"
                    >
                        {isEditing ? (
                            <>
                                <X className="w-3.5 h-3.5" /> Cancel Editing
                            </>
                        ) : (
                            <>
                                <Edit2 className="w-3.5 h-3.5 text-[#FF0B01]" /> Edit Profile
                            </>
                        )}
                    </button>
                </div>

                {/* Profile Information / Edit Form */}
                <div className="py-6 space-y-4 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF0B01] focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF0B01] focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF0B01] focus:bg-white transition-all"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF0B01] focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter your complete address"
                                    rows="2"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF0B01] focus:bg-white transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-[#FF0B01] hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-200 shadow-md shadow-red-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border-0"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </form>
                    ) : null}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    {onChangePasswordClick && (
                        <button
                            type="button"
                            onClick={onChangePasswordClick}
                            className="w-full border border-gray-200 hover:bg-gray-50 active:scale-[0.98] py-3.5 rounded-xl font-bold text-gray-600 transition duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            CHANGE PASSWORD
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full bg-[#FF2A14] hover:bg-[#E01E0A] active:scale-[0.98] text-white py-3.5 rounded-xl font-bold transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-red-500/10 cursor-pointer text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        LOGOUT
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full border border-gray-200 hover:bg-gray-50 active:scale-[0.98] py-3.5 rounded-xl font-semibold text-gray-500 transition duration-150 cursor-pointer text-sm"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProfilePopup;
