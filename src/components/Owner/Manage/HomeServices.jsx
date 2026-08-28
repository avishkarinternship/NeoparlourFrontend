import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';


import axiosInstance from '../../../api/axiosInstance';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const HomeServices = () => {
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode || document.documentElement.classList.contains('dark');


    const [serviceCharge, setServiceCharge] = useState('0.0');
    const [originalCharge, setOriginalCharge] = useState('0.0');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // TODO: Get salonId from auth context / Redux / localStorage
    const salonId = 1;

    const fetchHomeServiceCharge = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/salons/${salonId}/home-service-charges`);
            const charge = response.data || 0.0;
            setServiceCharge(charge.toString());
            setOriginalCharge(charge.toString());
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
                `/salons/home-service-charges?charges=${chargeValue}`
            );
            toast.success('Home service charge updated successfully', toastStyle);
            setOriginalCharge(serviceCharge);
            setIsEditing(false);
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

    const handleCancel = () => {
        setServiceCharge(originalCharge);
        setIsEditing(false);
    };

    const handleChargeChange = (e) => {
        let value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setServiceCharge(value);
        }
    };

    return (
                <main className={`flex-1 p-6 md:p-8 overflow-auto transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 md:border-l md:border-zinc-800' : 'bg-white md:border-l md:border-gray-200'}`}>
                    {/* Header */}
                    <div className="mb-10">
                        <div className="inline-block border-b-2 border-red-600 pb-1 mb-3">
                            <span className={`text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Home Service
                            </span>
                        </div>
                        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Home Service Charge</h1>
                        <p className={`mt-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                            Configure the additional charge applied when customers book services at their location.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className={`max-w-2xl border rounded-3xl p-8 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
                        <form onSubmit={handleSave} className="space-y-8">
                            {/* Service Charge Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-gray-700'}`}>
                                        Home Service Charge
                                    </label>
                                    {!isEditing && !loading && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="text-xs font-bold text-[#FF0B01] hover:text-red-700 transition flex items-center gap-1 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50/20"
                                        >
                                            ✏️ Edit Charge
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className={`absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-light ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>₹</div>

                                    <input
                                        type="text"
                                        value={serviceCharge}
                                        onChange={handleChargeChange}
                                        disabled={!isEditing || loading}
                                        className={`w-full pl-14 pr-6 py-5 text-4xl font-semibold rounded-2xl border transition-all ${
                                            isEditing 
                                                ? isDarkMode
                                                    ? 'border-red-500 focus:border-red-600 focus:ring-0 bg-zinc-900 text-white shadow-xs'
                                                    : 'border-red-500 focus:border-red-600 focus:ring-0 bg-white text-gray-900 shadow-xs' 
                                                : isDarkMode
                                                    ? 'border-zinc-700 bg-zinc-800/80 text-zinc-500 cursor-not-allowed'
                                                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                        placeholder="0.0"
                                    />
                                </div>

                                <p className={`mt-3 text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    This amount will be added to the final service total for every home service booking.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={saving || loading}
                                        className="flex-1 bg-[#FF0B01] hover:bg-red-700 disabled:opacity-70 transition-all text-white font-bold py-4 px-6 rounded-2xl text-base tracking-wider shadow-sm active:scale-[0.985]"
                                    >
                                        {saving ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className={`flex-1 border transition-all font-bold py-4 px-6 rounded-2xl text-base tracking-wider shadow-sm ${
                                            isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-700/50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Info Note */}
                    <div className={`max-w-2xl mt-8 text-xs flex items-start gap-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                        <span className="text-base leading-none mt-0.5">ℹ</span>
                        <p>
                            Changes will take effect immediately for new bookings. Existing bookings will not be affected.
                        </p>
                    </div>
                </main>
    );
};

export default HomeServices;