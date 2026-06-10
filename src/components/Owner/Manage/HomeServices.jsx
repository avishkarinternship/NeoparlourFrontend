import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";
import axiosInstance from '../../../api/axiosInstance';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const HomeServices = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [serviceCharge, setServiceCharge] = useState('0.0');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // TODO: Get salonId from auth context / Redux / localStorage
    const salonId = 1;

    const fetchHomeServiceCharge = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`salons/${salonId}/home-service-charges`);
            const charge = response.data || 0.0;
            setServiceCharge(charge.toString());
        } catch (error) {
            console.error(error);
            toast.error('Failed to load home service charge', toastStyle);
        } finally {
            setLoading(false);
        }
    }, [salonId]);

    useEffect(() => {
        fetchHomeServiceCharge();
    }, [fetchHomeServiceCharge]);

    const handleSave = async (e) => {
        e.preventDefault();

        const chargeValue = parseFloat(serviceCharge);
        if (isNaN(chargeValue) || chargeValue <= 0) {
            toast.error("Please enter a service charge greater than 0", toastStyle);
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.put(
                `salons/home-service-charges?charges=${chargeValue}`
            );
            toast.success('Home service charge updated successfully', toastStyle);
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || 'Failed to save settings',
                toastStyle
            );
        } finally {
            setSaving(false);
        }
    };

    const handleChargeChange = (e) => {
        let value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setServiceCharge(value);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full items-stretch">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar activeTab="Home Services" onTabChange={() => { }} />

                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="inline-block border-b-2 border-red-600 pb-1 mb-3">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-gray-900">
                                Home Service
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Home Service Charge</h1>
                        <p className="text-gray-500 mt-2">
                            Configure the additional charge applied when customers book services at their location.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="max-w-2xl bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                        <form onSubmit={handleSave} className="space-y-8">
                            {/* Service Charge Section */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Home Service Charge
                                </label>

                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400 font-light">₹</div>

                                    <input
                                        type="text"
                                        value={serviceCharge}
                                        onChange={handleChargeChange}
                                        disabled={loading}
                                        className="w-full pl-14 pr-6 py-5 text-4xl font-semibold rounded-2xl border border-gray-200 focus:border-red-500 focus:ring-0 transition-all bg-gray-50"
                                        placeholder="0.0"
                                    />
                                </div>

                                <p className="mt-3 text-sm text-gray-500">
                                    This amount will be added to the final service total for every home service booking.
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={saving || loading}
                                className="w-full bg-[#FF0B01] hover:bg-red-700 disabled:opacity-70 transition-all text-white font-bold py-4 px-8 rounded-2xl text-lg tracking-wider shadow-sm active:scale-[0.985]"
                            >
                                {saving ? 'Saving Changes...' : 'Save Charge Configuration'}
                            </button>
                        </form>
                    </div>

                    {/* Info Note */}
                    <div className="max-w-2xl mt-8 text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-base leading-none mt-0.5">ℹ</span>
                        <p>
                            Changes will take effect immediately for new bookings. Existing bookings will not be affected.
                        </p>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default HomeServices;