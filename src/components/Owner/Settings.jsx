import React, { useState } from 'react';
import Navbar from './Layouts/Navbar';
import Sidebar from './Layouts/SideBar';
import Footer from './Layouts/Footer';

const Settings = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // --- STATE MANAGEMENT ---
    const [businessName, setBusinessName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [appointmentNum, setAppointmentNum] = useState('');
    const [mobileNum, setMobileNum] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [stateName, setStateName] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [aboutText, setAboutText] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showBusinessHours, setShowBusinessHours] = useState(false);
    const [salonType, setSalonType] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);

    // Business Hours Ledger Matrix State
    const [businessHours, setBusinessHours] = useState([
        { day: 'Monday', startTime: '10:00 AM', endTime: '09:00 AM', status: 'Closed' },
        { day: 'Tuesday', startTime: '10:00 AM', endTime: '09:00 AM', status: 'Open' },
        { day: 'Wednesday', startTime: '10:00 AM', endTime: '09:00 AM', status: 'Open' },
        { day: 'Sunday', startTime: '10:00 AM', endTime: '09:00 AM', status: 'Open' },
        { day: 'Thursday', startTime: '10:00 AM', endTime: '09:00 AM', status: 'Open' },
        { day: 'Friday', startTime: '10:00 AM', endTime: '09:00 AM', status: 'Open' },
        { day: 'Saturday', startTime: '10:00 AM', endTime: '09:00 AM', status: 'Open' },
    ]);

    // --- HANDLERS ---
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleHoursChange = (index, key, value) => {
        const updatedHours = [...businessHours];
        updatedHours[index][key] = value;
        setBusinessHours(updatedHours);
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Saving Form Dataset:', {
            businessName, adminEmail, appointmentNum, mobileNum, address,
            country, stateName, city, postalCode, aboutText, salonType, businessHours
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">

            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full items-stretch">

                {/* --- SIDEBAR PANEL --- */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />


                {/* --- MAIN FORM CONFIGURATOR ENV --- */}
                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 space-y-8 overflow-y-auto">

                    <div className="max-w-4xl mx-auto border-b border-gray-200 pb-3">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Business Details</h2>
                    </div>

                    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8 divide-y divide-gray-200">

                        {/* SEGMENT 1: Business Logo Uplink */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 mb-1">Business Logo</h3>
                                <p className="text-[10px] text-gray-400 leading-normal font-medium">
                                    Upload A Logo To Appear On Your Emails, Invoices And Mini-Website.
                                </p>
                            </div>
                            <div className="md:col-span-2 flex justify-start">
                                {/* OUTER BORDER CONTAINER */}
                                <div className="w-[190px] h-[175px] border border-gray-300 rounded-xl p-3 bg-white flex items-center justify-center">

                                    {/* INNER IMAGE / DROPAZONE WRAPPER */}
                                    <label className="relative w-full h-full bg-[#959595] rounded-xl flex flex-col justify-center items-center cursor-pointer overflow-hidden group select-none">

                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <span className="text-[17px] font-bold text-white tracking-wide">
                                                    Your Logo
                                                </span>
                                            </div>
                                        )}

                                        {/* HIDDEN FILE INPUT SCHEMATIC */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoUpload}
                                        />

                                        {/* TOP RIGHT TRASH / ACTIONS TRIGGER ICON */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Call your handleRemoveLogo function or pass null to your state setter here
                                                if (logoPreview) {
                                                    setLogoPreview(null);
                                                }
                                            }}
                                            className="absolute top-0 right-0 w-[26px] h-[26px] bg-[#EFEFEF] hover:bg-gray-200 border-l border-b border-gray-300 rounded-bl-md flex items-center justify-center transition-colors"
                                        >
                                            {/* SVG Trash Icon precisely mirroring the UI specification wireframe */}
                                            <svg
                                                className="w-3.5 h-3.5 text-black"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2.5"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>

                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* SEGMENT 2: Business Info Data Entry matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 mb-1">Business Info</h3>
                                <p className="text-[10px] text-gray-400 leading-normal font-medium">
                                    The Name Of Your Business Is Prominently Showcased In Various Areas, Encompassing Your Online Booking Profile, Sales Receipts, And Messages Sent To Clients.
                                </p>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Business Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Admin E-Mail Id</label>
                                    <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Appointment Number</label>
                                    <input type="text" value={appointmentNum} onChange={(e) => setAppointmentNum(e.target.value)} className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Mobile Number</label>
                                    <input type="text" value={mobileNum} onChange={(e) => setMobileNum(e.target.value)} className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Address <span className="text-red-500">*</span></label>
                                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Country <span className="text-red-500">*</span></label>
                                    <select value={country} onChange={(e) => setCountry(e.target.value)} required className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-600">
                                        <option value="">Select Country</option>
                                        <option value="IN">India</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">State <span className="text-red-500">*</span></label>
                                    <select value={stateName} onChange={(e) => setStateName(e.target.value)} required className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-600">
                                        <option value="">Select State</option>
                                        <option value="MH">Maharashtra</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">City <span className="text-red-500">*</span></label>
                                    <select value={city} onChange={(e) => setCity(e.target.value)} required className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-600">
                                        <option value="">Select City</option>
                                        <option value="PN">Pune</option>
                                        <option value="MB">Mumbai</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Postal Code <span className="text-red-500">*</span></label>
                                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* SEGMENT 3: About Us Workspace */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 mb-1">About Us</h3>
                                <p className="text-[10px] text-gray-400 leading-normal font-medium">
                                    Describe Your Business Effectively With Neoparlour and Boost Your Visibility On Google.
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 mb-1">Type Your Message</label>
                                <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows="4" className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none placeholder-gray-300" placeholder="Type here..." />
                            </div>
                        </div>

                        {/* SEGMENT 4: Reset Credential Vault */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 mb-1">Reset Password</h3>
                                <p className="text-[10px] text-gray-400 leading-normal font-medium">
                                    You Have The Option To Reset Your Password Using This Feature.
                                </p>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">New Password</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Confirm Password</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* SEGMENT 5: Business Hours Scheduling Table Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 mb-1">Business Hours</h3>
                                <p className="text-[10px] text-gray-400 leading-normal font-medium mb-4">
                                    Specify Your Opening Closing Time For Your Business.
                                </p>
                                <div className="flex items-center justify-between bg-[#FAFAFA] border border-gray-200 p-2.5 rounded-lg max-w-[200px]">
                                    <span className="text-[10px] font-bold text-gray-500">Show/Hide Business Hours</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowBusinessHours(!showBusinessHours)}
                                        className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${showBusinessHours ? 'bg-[#FF0B01]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${showBusinessHours ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2 overflow-x-auto">
                                <table className="w-full border border-gray-200 rounded-xl overflow-hidden min-w-[450px]">
                                    <thead>
                                        <tr className="bg-[#EFEFEF]/70 text-left text-[11px] font-bold text-gray-800">
                                            <th className="py-2 px-4 border-b border-gray-200 w-1/4">Day</th>
                                            <th className="py-2 px-4 border-b border-gray-200 w-1/4">Start Time</th>
                                            <th className="py-2 px-4 border-b border-gray-200 w-1/4">End Time</th>
                                            <th className="py-2 px-4 border-b border-gray-200 w-1/4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {businessHours.map((row, index) => (
                                            <tr key={row.day} className="text-[11px] font-bold text-gray-700">
                                                <td className="py-2 px-4 text-gray-900 bg-[#FAFAFA]/50">{row.day}</td>
                                                <td className="py-1 px-2">
                                                    <select value={row.startTime} onChange={(e) => handleHoursChange(index, 'startTime', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded-md bg-[#FAFAFA] text-gray-600 focus:outline-none text-[10px]">
                                                        <option>10:00 AM</option>
                                                        <option>09:00 AM</option>
                                                        <option>08:00 AM</option>
                                                    </select>
                                                </td>
                                                <td className="py-1 px-2">
                                                    <select value={row.endTime} onChange={(e) => handleHoursChange(index, 'endTime', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded-md bg-[#FAFAFA] text-gray-600 focus:outline-none text-[10px]">
                                                        <option>09:00 AM</option>
                                                        <option>08:00 PM</option>
                                                        <option>09:00 PM</option>
                                                    </select>
                                                </td>
                                                <td className="py-1 px-2">
                                                    <select value={row.status} onChange={(e) => handleHoursChange(index, 'status', e.target.value)} className={`w-full px-2 py-1 border border-gray-200 rounded-md bg-[#FAFAFA] focus:outline-none text-[10px] ${row.status === 'Closed' ? 'text-red-500' : 'text-gray-700'}`}>
                                                        <option>Open</option>
                                                        <option>Closed</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SEGMENT 6: Salon Category Dropdown Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 mb-1">Salon Type</h3>
                            </div>
                            <div className="md:col-span-2">
                                <select value={salonType} onChange={(e) => setSalonType(e.target.value)} className="w-full sm:w-1/2 px-3 py-2 bg-[#FAFAFA] text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-500">
                                    <option value="">Salon type</option>
                                    <option value="unisex">Unisex Salon</option>
                                    <option value="mens">Men's Grooming Parlour</option>
                                    <option value="womens">Women's Beauty Spa</option>
                                </select>
                            </div>
                        </div>

                        {/* Commit Transaction Button Suite */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button type="submit" className="px-8 py-2 bg-[#FF0B01] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-red-700 transition-colors uppercase tracking-wider">
                                Save
                            </button>
                            <button type="button" className="px-8 py-2 bg-white border border-gray-300 text-gray-700 font-bold text-xs rounded-lg shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider">
                                Cancel
                            </button>
                        </div>

                    </form>
                </main>
            </div>

            {/* --- REUSABLE APPLICATION FOOTER PANEL --- */}
            <Footer />

        </div>
    );
}

export default Settings;