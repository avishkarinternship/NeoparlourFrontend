import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutOwnerStaffServer } from '../../redux/slices/ownerStaffSlice';

const OwnerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.ownerStaff);

  const handleLogout = async () => {
    try {
      await dispatch(logoutOwnerStaffServer()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate since local state is cleared in the thunk
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Simple Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900 tracking-tight">NeoParlour <span className="text-sm font-medium text-[#ff0b01]">Owner</span></span>
        </div>
        <button 
          onClick={handleLogout}
          disabled={loading}
          className={`px-4 py-2 bg-red-50 text-[#ff0b01] font-bold text-xs rounded-lg border border-red-100 hover:bg-red-100 transition-colors tracking-widest flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading && (
            <svg className="animate-spin h-3 w-3 text-[#ff0b01]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'LOGGING OUT...' : 'LOGOUT'}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 max-w-[1200px] mx-auto w-full">
        <div className="bg-white rounded-2xl p-8 shadow-sm" data-aos="fade-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || 'Owner'}!
          </h1>
          <p className="text-gray-500 mb-8">Manage your salon and business operations.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              onClick={() => navigate('/owner/appointments')}
              className="p-6 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-300" 
              data-aos="fade-up" 
              data-aos-delay="100"
            >
              <h3 className="font-bold text-red-900 mb-1">Bookings</h3>
              <p className="text-red-700 text-sm">Review incoming appointments.</p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl border border-orange-100" data-aos="fade-up" data-aos-delay="200">
              <h3 className="font-bold text-orange-900 mb-1">Staff</h3>
              <p className="text-orange-700 text-sm">Manage your team members.</p>
            </div>
            <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100" data-aos="fade-up" data-aos-delay="300">
              <h3 className="font-bold text-yellow-900 mb-1">Inventory</h3>
              <p className="text-yellow-700 text-sm">Track products and supplies.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100" data-aos="fade-up" data-aos-delay="400">
              <h3 className="font-bold text-gray-900 mb-1">Settings</h3>
              <p className="text-gray-700 text-sm">Update salon configurations.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
