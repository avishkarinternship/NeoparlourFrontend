import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Icons
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import nameIcon from '../../../assets/Owner/Manage/Staff/name_icon.svg';
import genderIcon from '../../../assets/Owner/Manage/Staff/gender_icon.svg';
import dateIcon from '../../../assets/Owner/Manage/Staff/BirthDateIcon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';
import idIcon from '../../../assets/Owner/Manage/Staff/team_member_icon.svg';


import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const Staff = () => {
    const location = useLocation();


    // Form States
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        birthdate: '',
        gender: ''
    });

    const [editingStaffId, setEditingStaffId] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFetchLoading, setEditFetchLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        birthdate: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        name: '',
        phone: '',
        email: '',
        status: ''
    });

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.phone) params.append('phone', filters.phone);
            if (filters.email) params.append('email', filters.email);
            if (filters.status) params.append('status', filters.status);

            const response = await axiosInstance.get(`staff/search?${params.toString()}`);
            setStaffList(response.data?.content || []);
        } catch (error) {
            toast.error('Failed to load staff', toastStyle);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '', phone: '', email: '', password: '', address: '', birthdate: '', gender: ''
        });
        setEditingStaffId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.email || !formData.password) {
            toast.error("Name, Phone, Email & Password are required", toastStyle);
            return;
        }

        setFormLoading(true);
        try {
            const payload = { ...formData };
            if (payload.gender === 'Other') {
                payload.gender = 'OTHERS';
            }

            await axiosInstance.post('staff', payload);
            toast.success('Staff created successfully', toastStyle);
            resetForm();
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed', toastStyle);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (staffId) => {
        setEditFetchLoading(true);
        setEditingStaffId(staffId);
        setIsEditModalOpen(true);
        try {
            const response = await axiosInstance.get(`staff/${staffId}`);
            const staff = response.data;
            setEditFormData({
                name: staff.name || '',
                phone: staff.phone || '',
                email: staff.email || '',
                address: staff.address || '',
                birthdate: staff.birthdate ? staff.birthdate.split('T')[0] : '',
                gender: staff.gender || ''
            });
        } catch (error) {
            toast.error('Failed to load staff details', toastStyle);
            setIsEditModalOpen(false);
            setEditingStaffId(null);
        } finally {
            setEditFetchLoading(false);
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (!editFormData.name || !editFormData.phone || !editFormData.email) {
            toast.error("Name, Phone & Email are required", toastStyle);
            return;
        }

        setFormLoading(true);
        try {
            const payload = { ...editFormData };
            if (payload.gender === 'Other') {
                payload.gender = 'OTHERS';
            }

            await axiosInstance.put(`staff/${editingStaffId}`, payload);
            toast.success('Staff updated successfully', toastStyle);
            closeEditModal();
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed', toastStyle);
        } finally {
            setFormLoading(false);
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingStaffId(null);
        setEditFormData({
            name: '', phone: '', email: '', address: '', birthdate: '', gender: ''
        });
    };

    useEffect(() => {
        if (location.state?.editStaffId && staffList.length > 0) {
            handleEdit(location.state.editStaffId);
        }
    }, [location.state?.editStaffId, staffList]);

    const handleToggleStatus = async (id, currentActive) => {
        try {
            await axiosInstance.put(`staff/${id}/toggle?active=${!currentActive}`);
            toast.success(`Staff ${!currentActive ? 'activated' : 'deactivated'}`, toastStyle);
            fetchStaff();
        } catch (error) {
            toast.error('Failed to update status', toastStyle);
        }
    };

    return (
        <>
                <main className="flex-1 p-6 md:p-8 bg-white md:border-l md:border-gray-200 overflow-auto">
                    {/* Add New Staff Form */}
                    <div className="max-w-3xl border border-gray-200 rounded-2xl p-6 bg-white shadow-sm mb-8">
                        <h2 className="text-xl font-bold mb-6">Add New Staff</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <img src={nameIcon} alt="Name" className="w-4 h-4 mr-2.5" />
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full text-sm outline-none bg-transparent" required />
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <img src={genderIcon} alt="Gender" className="w-4 h-4 mr-2.5" />
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full text-sm outline-none bg-transparent"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHERS">Other</option>
                                    </select>
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full text-sm outline-none bg-transparent" required />
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full text-sm outline-none bg-transparent" required />
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full text-sm outline-none bg-transparent" required />
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <input type="date" name="birthdate" value={formData.birthdate} onChange={handleInputChange} className="w-full text-sm outline-none bg-transparent" />
                                </div>

                                <div className="md:col-span-2">
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full border border-gray-200 rounded-xl p-3 text-sm" rows={3} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={formLoading} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-70">
                                    {formLoading ? 'Saving...' : 'Save Staff'}
                                </button>
                                <button type="button" onClick={resetForm} className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50">
                                    Discard
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Staff List */}
                    <div className="max-w-4xl">
                        <h3 className="text-lg font-bold mb-4">Staff Members</h3>

                        {loading ? (
                            <div className="text-center py-12">Loading staff...</div>
                        ) : staffList.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No staff found</div>
                        ) : (
                            <div className="space-y-3">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all gap-4">
                                        <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold flex-shrink-0">
                                                {staff.name?.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-gray-900 truncate">{staff.name}</h4>
                                                <p className="text-xs sm:text-sm text-gray-500 break-all">{staff.phone} • {staff.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto border-t border-gray-50 pt-3 sm:pt-0 sm:border-t-0 flex-shrink-0">
                                            <div className="flex items-center gap-2 mr-2">
                                                <button
                                                    onClick={() => handleToggleStatus(staff.id, staff.active)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        staff.active ? 'bg-green-500' : 'bg-gray-200'
                                                    }`}
                                                    role="switch"
                                                    aria-checked={staff.active}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                            staff.active ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <span className={`text-xs font-bold w-12 text-left ${staff.active ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {staff.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <button onClick={() => handleEdit(staff.id)} className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                                                <img src={editIcon} alt="edit" className="w-4 h-4" /> Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

            {/* Edit Staff Modal Overlay */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={closeEditModal}
                    />
                    
                    {/* Modal Window */}
                    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edit Staff Member</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Update user profile details</p>
                            </div>
                            <button 
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {editFetchLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                    <div className="animate-spin h-8 w-8 border-3 border-red-600 border-t-transparent rounded-full"></div>
                                    <p className="text-xs text-gray-400 font-semibold animate-pulse">Fetching staff details...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitEdit} className="space-y-4">
                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                                <img src={nameIcon} alt="Name" className="w-4 h-4 mr-2.5" />
                                                <input 
                                                    type="text" 
                                                    name="name" 
                                                    value={editFormData.name} 
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))} 
                                                    placeholder="Full Name" 
                                                    className="w-full text-sm outline-none bg-transparent" 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                                <img src={genderIcon} alt="Gender" className="w-4 h-4 mr-2.5" />
                                                <select
                                                    name="gender"
                                                    value={editFormData.gender}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, gender: e.target.value }))}
                                                    className="w-full text-sm outline-none bg-transparent"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="MALE">Male</option>
                                                    <option value="FEMALE">Female</option>
                                                    <option value="OTHERS">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                                <input 
                                                    type="tel" 
                                                    name="phone" 
                                                    value={editFormData.phone} 
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))} 
                                                    placeholder="Phone Number" 
                                                    className="w-full text-sm outline-none bg-transparent" 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                                <input 
                                                    type="email" 
                                                    name="email" 
                                                    value={editFormData.email} 
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))} 
                                                    placeholder="Email Address" 
                                                    className="w-full text-sm outline-none bg-transparent" 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Birthdate</label>
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                                <input 
                                                    type="date" 
                                                    name="birthdate" 
                                                    value={editFormData.birthdate} 
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, birthdate: e.target.value }))} 
                                                    className="w-full text-sm outline-none bg-transparent" 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
                                            <textarea 
                                                name="address" 
                                                value={editFormData.address} 
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))} 
                                                placeholder="Address" 
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 bg-[#F9F9F9]" 
                                                rows={2} 
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-4 border-t border-gray-100 flex-shrink-0">
                                        <button 
                                            type="submit" 
                                            disabled={formLoading} 
                                            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-70 transition-all text-sm h-11"
                                        >
                                            {formLoading ? 'Saving...' : 'Update Staff'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={closeEditModal} 
                                            className="flex-1 border border-gray-300 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm text-gray-700 h-11"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Staff;