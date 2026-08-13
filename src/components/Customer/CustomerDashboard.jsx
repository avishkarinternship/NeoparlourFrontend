import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../../redux/slices/customerSlice';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.customer);

  const handleLogout = () => {
    dispatch(logoutCustomer());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Simple Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900 tracking-tight">NeoParlour</span>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 text-[#ff0b01] font-bold text-xs rounded-lg border border-red-100 hover:bg-red-100 transition-colors tracking-widest"
        >
          LOGOUT
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 max-w-[1200px] mx-auto w-full">
        <div className="bg-white rounded-2xl p-8 shadow-sm" data-aos="fade-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="text-gray-500 mb-8">This is your personalized dashboard.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => navigate('/appointments')}
              className="p-6 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-300" 
              data-aos="fade-up" 
              data-aos-delay="100"
            >
              <h3 className="font-bold text-blue-900 mb-1">My Appointments</h3>
              <p className="text-blue-700 text-sm">View and manage your bookings.</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-100" data-aos="fade-up" data-aos-delay="200">
              <h3 className="font-bold text-purple-900 mb-1">My Profile</h3>
              <p className="text-purple-700 text-sm">Update your personal information.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl border border-green-100" data-aos="fade-up" data-aos-delay="300">
              <h3 className="font-bold text-green-900 mb-1">Notifications</h3>
              <p className="text-green-700 text-sm">Check your latest updates.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
