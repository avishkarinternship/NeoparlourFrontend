import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail, Phone, MapPin, Calendar, LogOut, User, Edit2, Save } from 'lucide-react';
import { fetchCustomerProfile, logoutCustomerApi, updateCustomerProfile } from '../../redux/slices/customerSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfilePopup = ({ isOpen, onClose, onChangePasswordClick }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, profile, loading, isAuthenticated } = useSelector((state) => state.customer);

    const [isEditing, setIsEditing] = useState(false);
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
        setFormData(prev => ({ ...prev, [name]: value }));
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

        dispatch(updateCustomerProfile(payload))
            .unwrap()
            .then(() => {
                toast.success("Profile updated successfully");
                setIsEditing(false);
            })
            .catch((err) => {
                toast.error(err || "Failed to update profile");
            });
    };

    const firstInitial = ((profile?.fullName || user?.name || user?.username || 'P').charAt(0)).toUpperCase();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 transition-all duration-300 font-sans">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 z-10 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {loading && !profile ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Profile...</p>
                    </div>
                ) : isEditing ? (
                    <form onSubmit={handleSave} className="w-full flex flex-col items-center">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 uppercase">
                            Edit Profile
                        </h3>

                        <div className="w-full space-y-4 max-h-[350px] overflow-y-auto pr-1">
                            {/* Full Name */}
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your name"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all text-gray-700"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all text-gray-700"
                                />
                            </div>

                            {/* Mobile Number */}
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    placeholder="Enter 10 digit number"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all text-gray-700"
                                />
                            </div>

                            {/* Gender */}
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all text-gray-700"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            {/* Birthdate */}
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Birthdate</label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all text-gray-700"
                                />
                            </div>

                            {/* Address */}
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Home Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter your address"
                                    rows="2"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all text-gray-700 resize-none"
                                />
                            </div>
                        </div>

                        {/* Save & Cancel Buttons */}
                        <div className="w-full mt-6 flex flex-col gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#FF2A14] hover:bg-[#E01E0A] disabled:bg-red-400 disabled:cursor-not-allowed active:scale-[0.98] text-white py-3.5 rounded-xl font-bold transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-red-500/10 cursor-pointer text-sm"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="w-full border border-gray-200 hover:bg-gray-50 active:scale-[0.98] py-3.5 rounded-xl font-semibold text-gray-500 transition duration-150 cursor-pointer text-sm"
                            >
                                CANCEL
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col items-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white font-black text-3xl flex items-center justify-center shadow-lg mb-4">
                            {firstInitial}
                        </div>

                        {/* Name */}
                        <h3 className="text-xl font-black text-gray-900 text-center tracking-tight mb-6">
                            {profile?.fullName || user?.name || user?.username || 'Profile Details'}
                        </h3>

                        {/* Info Fields */}
                        <div className="w-full space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {/* Email */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                                    <span className="text-sm font-semibold text-gray-700 truncate">{profile?.email || 'Not provided'}</span>
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</span>
                                    <span className="text-sm font-semibold text-gray-700">{profile?.mobile || 'Not provided'}</span>
                                </div>
                            </div>

                            {/* Gender */}
                            {profile?.gender && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</span>
                                        <span className="text-sm font-semibold text-gray-700 capitalize">{profile.gender.toLowerCase()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Birth Date */}
                            {(profile?.birthdate || profile?.birthDate) && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Birthdate</span>
                                        <span className="text-sm font-semibold text-gray-700">{profile.birthdate || profile.birthDate}</span>
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Home Address</span>
                                    <span className="text-sm font-semibold text-gray-700 leading-normal">{profile?.address || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Buttons Footer */}
                        <div className="w-full mt-8 flex flex-col gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full border border-[#FF2A14] hover:bg-red-50 text-[#FF2A14] py-3.5 rounded-xl font-bold transition duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
                            >
                                <Edit2 className="w-4 h-4" />
                                EDIT PROFILE
                            </button>
                            {onChangePasswordClick && (
                                <button
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
                                onClick={handleLogout}
                                className="w-full bg-[#FF2A14] hover:bg-[#E01E0A] active:scale-[0.98] text-white py-3.5 rounded-xl font-bold transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-red-500/10 cursor-pointer text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                LOGOUT
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full border border-gray-200 hover:bg-gray-50 active:scale-[0.98] py-3.5 rounded-xl font-semibold text-gray-500 transition duration-150 cursor-pointer text-sm"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePopup;
