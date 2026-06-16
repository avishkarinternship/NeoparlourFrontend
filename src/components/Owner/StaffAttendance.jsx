import React, { useState } from 'react';
import Footer from './Layouts/Footer';
import Navbar from './Layouts/Navbar';
import Sidebar from './Layouts/Sidebar';

// Consolidated Asset Imports from src/assets/Owner/Attendance/
import total_attendance from '../../assets/Owner/Attendance/total_attendance.svg';
import total_employee from '../../assets/Owner/Attendance/total_employee.svg';
import on_leave from '../../assets/Owner/Attendance/on_leave.svg';
import searchIcon from '../../assets/Owner/Attendance/search.svg';
import customOrder from '../../assets/Owner/Attendance/custom_order.svg';

export default function StaffAttendance() {
  // Mock data matching your screen's UI cards
  const [attendanceData] = useState([
    { id: 1, name: 'Pravin Khope', hours: '240h - 0m / 0s', presentDays: 30, inventory: { generic: 1500, shampoo: 15, sheet: 25, lotion: 10 } },
    { id: 2, name: 'Pravin Khope', hours: '240h - 0m / 0s', presentDays: 30, inventory: { generic: 1500, shampoo: 15, sheet: 25, lotion: 10 } },
    { id: 3, name: 'Pravin Khope', hours: '240h - 0m / 0s', presentDays: 30, inventory: { generic: 1500, shampoo: 15, sheet: 25, lotion: 10 } },
  ]);

  // Track selected date card (initializes with date 4 active)
  const [activeDate, setActiveDate] = useState(4);
  
  // Track selected month/year input values
  const [chosenMonthYear, setChosenMonthYear] = useState({ monthName: 'July', yearNum: '2026', rawVal: '2026-07' });

  // Map of months to display names
  const monthsMap = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Calendar dates mock array
  const days = [
    { day: 'Mon', date: 1 },
    { day: 'Tue', date: 2 },
    { day: 'Wed', date: 3 },
    { day: 'Thu', date: 4 }, 
    { day: 'Fri', date: 5 },
    { day: 'Sat', date: 6 },
    { day: 'Sun', date: 7 },
    { day: 'Mon', date: 8 },
    { day: 'Tue', date: 9 },
    { day: 'Wed', date: 10 },
    { day: 'Thu', date: 11 },
    { day: 'Fri', date: 12 },
    { day: 'Sat', date: 13 },
  ];

  // Handle month picker selections
  const handleMonthInputChange = (e) => {
    const val = e.target.value; // Format: YYYY-MM
    if (!val) return;
    
    const [year, month] = val.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    
    setChosenMonthYear({
      monthName: monthsMap[monthIndex],
      yearNum: year,
      rawVal: val
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 1. Global Navigation Bar Header */}
      <Navbar />
        
      {/* Main Container Layer with Sidebar */}
      <div className="flex flex-1"> 
        
        {/* 2. Left Application Sidebar Component */}
        <Sidebar />

        {/* 3. Main Dashboard Window Area */}
        <main className="flex-1 p-8 bg-[#FDFDFD] flex flex-col justify-between">
          
          <div>
            {/* Header Row Title */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-800">Employee Attendance</h1>
            </div>

            {/* Metrics Summaries Grid Row using Imported SVGs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Total Attendance */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-center">
                    <img src={total_attendance} alt="Total Attendance" className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Total Attendance</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center text-[11px] font-bold text-red-500">
                  87%
                </div>
              </div>

              {/* Total Employee */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-center">
                    <img src={total_employee} alt="Total Employee" className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Total Employee</span>
                </div>
                <span className="text-2xl font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">20</span>
              </div>

              {/* On Leave */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-center">
                    <img src={on_leave} alt="On Leave" className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">On Leave</span>
                </div>
                <span className="text-2xl font-bold text-red-500 bg-red-50 px-4 py-1 rounded-lg">3</span>
              </div>
            </div>

            {/* Filter & Search Panel Row using Asset Icons */}
            <div className="bg-[#F8F9FA] rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-100">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <img src={searchIcon} alt="Search" className="w-4 h-4 text-gray-400" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search Team Member" 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <img src={customOrder} alt="Custom Order" className="w-4 h-4" />
                <span>Custom Order</span>
                <span className="text-[10px] text-gray-400 ml-1">▼</span>
              </button>
            </div>

            {/* Dynamic Interactive Horizontal Date Scrollbar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-wider text-gray-700 uppercase">DATE</h2>
                <div className="flex items-center gap-4 font-semibold text-sm text-gray-700 relative">
                  <button className="hover:text-orange-500 transition-colors">◀</button>
                  
                  {/* Interactive Label holding a hidden native month input */}
                  <label className="cursor-pointer hover:text-orange-500 transition-colors relative flex items-center">
                    <span>{chosenMonthYear.monthName} {chosenMonthYear.yearNum}</span>
                    <input 
                      type="month" 
                      value={chosenMonthYear.rawVal}
                      onChange={handleMonthInputChange}
                      onClick={(e) => {
                        // Triggers the calendar popover across modern browsers natively when clicking the text
                        try { e.target.showPicker(); } catch (err) {}
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  
                  <button className="hover:text-orange-500 transition-colors">▶</button>
                </div>
              </div>

              {/* Day Cards Wrap Layout */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-between bg-white p-3 rounded-xl border border-gray-50">
                {days.map((item, idx) => {
                  const isCurrentActive = activeDate === item.date;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setActiveDate(item.date)}
                      className={`flex flex-col items-center min-w-[50px] p-2 rounded-full cursor-pointer transition-all ${
                        isCurrentActive 
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-105' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-[11px] mb-1">{item.day}</span>
                      <span className={`text-sm font-bold ${isCurrentActive ? 'text-white' : 'text-gray-800'}`}>
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Employee Info Summary Attendance Cards Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {attendanceData.map((emp) => (
                <div key={emp.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-700">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{emp.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">01 March 2026 to 31 March 2026</p>
                    </div>
                  </div>

                  {/* Operational Clock Hours Block */}
                  <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-medium">Total Hours</span>
                      <span className="font-semibold text-gray-800">{emp.hours}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-medium">Present Days</span>
                      <span className="font-semibold text-gray-800">{emp.presentDays} Days</span>
                    </div>
                  </div>

                  {/* Stock/Inventory Resource Breakdown Data Row */}
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-medium mb-2">Inventory Used</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                      <div className="flex justify-between"><span>RM Style:</span> <span className="font-bold">{emp.inventory.generic}</span></div>
                      <div className="flex justify-between"><span>Shampoo:</span> <span className="font-bold">{emp.inventory.shampoo}</span></div>
                      <div className="flex justify-between"><span>Sheet:</span> <span className="font-bold">{emp.inventory.sheet}</span></div>
                      <div className="flex justify-between"><span>Lotion:</span> <span className="font-bold">{emp.inventory.lotion}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Global Structural Footer Layout Module */}
          <Footer />

        </main>
      </div>
    </div>
  );
}