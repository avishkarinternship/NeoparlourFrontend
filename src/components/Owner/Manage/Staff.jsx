import React, { useState, useEffect, useCallback } from 'react';

// Icons
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import nameIcon from '../../../assets/Owner/Manage/Staff/name_icon.svg';
import genderIcon from '../../../assets/Owner/Manage/Staff/gender_icon.svg';
import dateIcon from '../../../assets/Owner/Manage/Staff/BirthDateIcon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';
import idIcon from '../../../assets/Owner/Manage/Staff/team_member_icon.svg';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from '../Layouts/ManageSideBar';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const Staff = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        if (!formData.name || !formData.phone || !formData.email) {
            toast.error("Name, Phone & Email are required", toastStyle);
            return;
        }

        setFormLoading(true);
        try {
            if (editingStaffId) {
                // Update Staff
                await axiosInstance.put(`staff/${editingStaffId}`, formData);
                toast.success('Staff updated successfully', toastStyle);
            } else {
                // Create Staff
                await axiosInstance.post('staff', formData);
                toast.success('Staff created successfully', toastStyle);
            }
            resetForm();
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed', toastStyle);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (staff) => {
        setFormData({
            name: staff.name || '',
            phone: staff.phone || '',
            email: staff.email || '',
            password: '', // Don't populate password
            address: staff.address || '',
            birthdate: staff.birthdate ? staff.birthdate.split('T')[0] : '',
            gender: staff.gender || ''
        });
        setEditingStaffId(staff.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full items-stretch">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar activeTab="Staff" onTabChange={() => { }} />

                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    {/* Add / Edit Staff Form */}
                    <div className="max-w-3xl border border-gray-200 rounded-2xl p-6 bg-white shadow-sm mb-8">
                        <h2 className="text-xl font-bold mb-6">
                            {editingStaffId ? 'Edit Staff' : 'Add New Staff'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <img src={nameIcon} alt="Name" className="w-4 h-4 mr-2.5" />
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full text-sm outline-none bg-transparent" required />
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <img src={genderIcon} alt="Gender" className="w-4 h-4 mr-2.5" />
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full text-sm outline-none bg-transparent">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full text-sm outline-none bg-transparent" required />
                                </div>

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full text-sm outline-none bg-transparent" required />
                                </div>

                                {!editingStaffId && (
                                    <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full text-sm outline-none bg-transparent" required />
                                    </div>
                                )}

                                <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9]">
                                    <input type="date" name="birthdate" value={formData.birthdate} onChange={handleInputChange} className="w-full text-sm outline-none bg-transparent" />
                                </div>

                                <div className="md:col-span-2">
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full border border-gray-200 rounded-xl p-3 text-sm" rows={3} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={formLoading} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-70">
                                    {formLoading ? 'Saving...' : editingStaffId ? 'Update Staff' : 'Save Staff'}
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
                                    <div key={staff.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">
                                                {staff.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{staff.name}</h4>
                                                <p className="text-sm text-gray-500">{staff.phone} • {staff.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggleStatus(staff.id, staff.active)}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-lg ${staff.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {staff.active ? 'Active' : 'Inactive'}
                                            </button>
                                            <button onClick={() => handleEdit(staff)} className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                                                <img src={editIcon} alt="edit" className="w-4 h-4" /> Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Staff;