import React, { useState } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';

// FILE PATH INTEGRATION (Climbing out 3 levels to source assets)
import assignStaffIcon from '../../../assets/Owner/Manage/Schedule/assign_staff_icon.svg';
import calendarIcon from '../../../assets/Owner/Manage/Schedule/calender_icon.svg';
import clockIcon from '../../../assets/Owner/Manage/Schedule/clock_icon.svg';
import profileIcon from '../../../assets/Owner/Manage/Schedule/profile_icon.jpg';
import ManageSideBar from "../Layouts/ManageSideBar";

const Schedule = ()  => {
  const [currentSubTab, setCurrentSubTab] = useState('Scheduled');

  // Integrated profileIcon fallback into your appointment rendering array
  const appointments = Array(5).fill({
    name: 'Prowin Wadkar',
    service: 'Hair Cut',
    date: '27 Feb 2026',
    time: '12:30 PM',
    avatar: profileIcon 
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
      {/* NAVBAR */}
      <Navbar />

      {/* SYSTEM GRID FRAMEWORK */}
      <div className="flex flex-1 w-full">
        {/* LEVEL 1 GENERAL SIDEBAR */}
        <Sidebar />

        {/* LEVEL 2 SUB-SIDEBAR (Contextual options) */}
        <ManageSideBar activeTab="Schedule" onTabChange={(tab) => console.log(`Navigating to ${tab}`)} />

        {/* MAIN DATA FEED CANVAS */}
        <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200">
          
          {/* Top Filter Management Tabs */}
          <div className="flex items-center space-x-6 border-b border-gray-200 pb-3 mb-6 text-xs font-bold uppercase tracking-wider text-gray-400">
            <button 
              onClick={() => setCurrentSubTab('Scheduled')}
              className={`pb-3 -mb-[14px] transition-all relative ${currentSubTab === 'Scheduled' ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold' : 'hover:text-gray-600'}`}
            >
              Scheduled
            </button>
            <button 
              onClick={() => setCurrentSubTab('Cancelled')}
              className={`pb-3 -mb-[14px] transition-all relative ${currentSubTab === 'Cancelled' ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold' : 'hover:text-gray-600'}`}
            >
              Cancelled
            </button>
            <button 
              onClick={() => setCurrentSubTab('Completed')}
              className={`pb-3 -mb-[14px] transition-all relative ${currentSubTab === 'Completed' ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold' : 'hover:text-gray-600'}`}
            >
              Completed
            </button>
          </div>

          {/* Interactive Row Stack */}
          <div className="space-y-4 max-w-5xl mt-8">
            {appointments.map((appt, index) => (
              <div 
                key={index} 
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all gap-4"
              >
                {/* Profile Identity block */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={appt.avatar} alt={appt.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900 tracking-tight">{appt.name}</h4>
                    
                    {/* Horizontal meta elements container */}
                    <div className="flex items-center space-x-3 text-[11px] font-semibold text-gray-400 mt-1">
                      <span className="text-gray-500">{appt.service}</span>
                      
                      {/* Calendar Inline Icon */}
                      <span className="flex items-center text-gray-400">
                        <img 
                          src={calendarIcon} 
                          alt="Calendar" 
                          className="w-3.5 h-3.5 mr-1 object-contain flex-shrink-0" 
                        /> 
                        {appt.date}
                      </span>
                      
                      {/* Clock Inline Icon */}
                      <span className="flex items-center text-gray-400">
                        <img 
                          src={clockIcon} 
                          alt="Clock" 
                          className="w-3.5 h-3.5 mr-1 object-contain flex-shrink-0" 
                        /> 
                        {appt.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center space-x-2 w-full lg:w-auto justify-end text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <button className="flex-1 lg:flex-initial bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-100 whitespace-nowrap">
                    Reschedule
                  </button>
                  <button className="flex-1 lg:flex-initial bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors whitespace-nowrap">
                    Cancel
                  </button>
                  
                  {/* Assign Staff Button with integrated custom SVG asset */}
                  <button className="flex-1 lg:flex-initial border border-gray-300 text-gray-400 px-3.5 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-colors flex items-center justify-center space-x-1.5 whitespace-nowrap">
                    <img 
                      src={assignStaffIcon} 
                      alt="Assign Staff" 
                      className="w-4 h-4 object-contain flex-shrink-0 filter grayscale" 
                    />
                    <span className="text-[10px] tracking-tight">Assign Staff</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </main>
      </div>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}

export default Schedule;