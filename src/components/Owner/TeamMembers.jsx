import React, { useState } from 'react';
import Navbar from './Layouts/Navbar';
import Sidebar from './Layouts/SideBar';
import Footer from './Layouts/Footer';

// Custom Specified Team Members Asset Imports
import searchIcon from '../../assets/Owner/TeamMembers/search_icon.svg';
import filterIcon from '../../assets/Owner/TeamMembers/filter_icon.svg';
import customOrderIcon from '../../assets/Owner/TeamMembers/custom_order_icon.svg';

const TeamMembers = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Team dataset matching your specified parameters
    const [teamList, setTeamList] = useState([
        {
            id: 'tm_001',
            name: 'Akash Chaudhari',
            avatar: '', 
            birthDate: '29/01/1998',
            startDate: '01 July 2026',
            speciality: 'Hair Stylist',
            isSelected: false
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectAll, setSelectAll] = useState(false);

    // Individual checkbox toggle action handler logic
    const handleSelectRow = (id) => {
        setTeamList(prev => prev.map(item => 
            item.id === id ? { ...item, isSelected: !item.isSelected } : item
        ));
    };

    // Master checkbox select-all toggle execution loop
    const handleSelectAll = () => {
        const nextState = !selectAll;
        setSelectAll(nextState);
        setTeamList(prev => prev.map(item => ({ ...item, isSelected: nextState })));
    };

    const handleActionTrigger = (id, actionType) => {
        console.log(`Executing target context macro rule [${actionType}] over node entity record: ${id}`);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVIGATION PANEL */}
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* TWO COLUMN INTEGRATION BODY WRAPPER CONTAINER */}
            <div className="flex flex-1 w-full items-stretch">
                
                {/* PRIMARY WORKSPACE FLOW NAVIGATION CONTROL */}
                <Sidebar activeTab="Team" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* ACTIVE SUBSYSTEM MONITOR DISPLAY CANVAS ENVIRONMENT */}
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200 space-y-6">
                    
                    {/* Header Title Section Line Block */}
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-[16px] font-bold text-gray-900 tracking-tight">
                            Team Members
                        </h1>
                    </div>

                    {/* Filter and Global Query Toolbar Input Row Segment Controls */}
                    <div className="max-w-6xl mx-auto bg-[#F5F5F5] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                        
                        <div className="flex items-center space-x-3 flex-1 min-w-[260px] max-w-md">
                            {/* Input Search Container Group Node */}
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
                                    <img 
                                        src={searchIcon} 
                                        alt="Search Icon" 
                                        className="w-3.5 h-3.5 opacity-60"
                                    />
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Team Member"
                                    className="w-full pl-9 pr-4 py-2 bg-white text-[11px] font-medium text-gray-800 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>

                            {/* Native Filter Layout Action Node Box Trigger */}
                            <button
                                type="button"
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors shrink-0"
                            >
                                <span>Filters</span>
                                <img 
                                    src={filterIcon} 
                                    alt="Filter Icon" 
                                    className="w-3 h-3 text-gray-700"
                                />
                            </button>
                        </div>

                        {/* Order Controller Sorter Menu Matrix Group */}
                        <div className="flex items-center shrink-0">
                            <button
                                type="button"
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                                <span>Custom Order</span>
                                <img 
                                    src={customOrderIcon} 
                                    alt="Custom Order Icon" 
                                    className="w-3 h-3 text-gray-700"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Itemized Team Directory Tabular System Block */}
                    <div className="max-w-6xl mx-auto overflow-x-auto">
                        <table className="w-full border-collapse min-w-[600px]">
                            
                            {/* Table Column Headers Design Mapping Scheme Layer */}
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-[11px] font-bold text-gray-900 tracking-wider">
                                    <th className="py-4 pl-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="w-3.5 h-3.5 accent-[#FF0B01] border-gray-300 rounded cursor-pointer focus:ring-0"
                                        />
                                    </th>
                                    <th className="py-4 px-4 font-bold">Name</th>
                                    <th className="py-4 px-4 font-bold">Details</th>
                                    <th className="py-4 px-4 font-bold">Speciality</th>
                                    <th className="py-4 pr-4 text-right font-bold w-28"></th>
                                </tr>
                            </thead>

                            {/* Data Iteration Output Wrapper Element Container Segment */}
                            <tbody className="divide-y divide-gray-100">
                                {teamList
                                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((member) => (
                                        <tr key={member.id} className="text-[11px] font-medium text-gray-700 hover:bg-gray-50/50 transition-colors">
                                            
                                            {/* Row Selector Input Segment Context Trigger */}
                                            <td className="py-5 pl-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={member.isSelected}
                                                    onChange={() => handleSelectRow(member.id)}
                                                    className="w-3.5 h-3.5 accent-[#FF0B01] border-gray-300 rounded cursor-pointer focus:ring-0"
                                                />
                                            </td>

                                            {/* User Profile Signature and Name Meta Column Group */}
                                            <td className="py-5 px-4">
                                                <div className="flex items-center space-x-3.5">
                                                    {member.avatar ? (
                                                        <img 
                                                            src={member.avatar} 
                                                            alt={member.name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 uppercase tracking-wider shadow-sm border border-gray-100">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-gray-900 text-[12px] tracking-tight">
                                                        {member.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date Parameters Activity Metrics Block Content String */}
                                            <td className="py-5 px-4 text-gray-600 space-y-0.5">
                                                <div>Birthdate - {member.birthDate}</div>
                                                <div>Start Date - {member.startDate}</div>
                                            </td>

                                            {/* Functional Operational Capability Domain Specialty Marker Tag */}
                                            <td className="py-5 px-4 font-semibold text-gray-900">
                                                {member.speciality}
                                            </td>

                                            {/* Custom Action Trigger Switch Segment Element Drawer Dropdown */}
                                            <td className="py-5 pr-4 text-right">
                                                <div className="inline-block relative">
                                                    <select
                                                        onChange={(e) => handleActionTrigger(member.id, e.target.value)}
                                                        defaultValue=""
                                                        className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-7 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-gray-400 transition-colors cursor-pointer text-center"
                                                    >
                                                        <option value="" disabled hidden>Actions</option>
                                                        <option value="edit">Edit Profile</option>
                                                        <option value="permissions">Permissions</option>
                                                        <option value="delete">Remove Member</option>
                                                    </select>
                                                    {/* Custom absolute placement element arrow indicators block */}
                                                    <span className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 pointer-events-none text-[8px]">
                                                        ▼
                                                    </span>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                            </tbody>

                        </table>
                    </div>

                </main>
            </div>

            {/* GLOBAL REUSABLE APPLICATION FOOTER PANEL */}
            <Footer />
        </div>
    );
}

export default TeamMembers;