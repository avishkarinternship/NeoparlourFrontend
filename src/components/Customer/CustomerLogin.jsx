import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

// Import from Customer Slice
import { loginCustomer, clearCustomerError } from '../../redux/slices/customerSlice';
// Import from OwnerStaff Slice
import { setActiveTab, loginOwner, clearOwnerStaffError } from '../../redux/slices/ownerStaffSlice';

// Using your existing assets
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import mobileIcon from '../../assets/CustomerRegister/mobile_icon.svg';
import passwordIcon from '../../assets/CustomerRegister/password_icon.svg';
import rightBackground from '../../assets/CustomerLogin/right_background.jpg';

const CustomerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pulling state from both slices
  const { activeTab, loading: ownerLoading, error: ownerError, isAuthenticated: isOwnerAuthenticated, user: ownerUser } = useSelector((state) => state.ownerStaff);
  const { loading: customerLoading, error: customerError, isAuthenticated: isCustomerAuthenticated, user: customerUser } = useSelector((state) => state.customer);

  const loading = activeTab === 'OWNER' ? ownerLoading : customerLoading;
  const error = activeTab === 'OWNER' ? ownerError : customerError;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOwnerAuthenticated && ownerUser) {
      navigate('/customer/login');
    } else if (isCustomerAuthenticated && customerUser) {
      // After customer login, redirect to salon selection
      navigate('/customer/select-salon');
    }
  }, [isOwnerAuthenticated, isCustomerAuthenticated, ownerUser, customerUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
    dispatch(clearOwnerStaffError());
    dispatch(clearCustomerError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'OWNER') {
      dispatch(loginOwner(formData));
    } else {
      dispatch(loginCustomer(formData));
      navigate('/customer/select-salon');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* Left Form Side - Full Height */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col items-center justify-center py-12 md:py-16 px-8 sm:px-16 lg:px-24 bg-white z-10">
        <div className="w-full max-w-[440px]" data-aos="fade-right" data-aos-delay="200">
          
          {/* Logo Section */}
          <div className="flex items-center gap-5 mb-12 md:mb-16 justify-center lg:justify-start">
            <img src={logoIcon} alt="NeoParlour Logo" className="w-14 h-14 object-contain" />
            <span className="text-[28px] md:text-[36px] font-bold text-gray-900 tracking-tight">NeoParlour</span>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-10 md:gap-14 mb-12 justify-center lg:justify-start">
            <button 
              onClick={() => handleTabChange('CUSTOMER')}
              className={`pb-4 text-[13px] md:text-[14px] font-bold tracking-[0.2em] transition-all ${
                activeTab === 'CUSTOMER' 
                ? 'text-gray-900 border-b-2 border-[#ff0b01]' 
                : 'text-gray-300 hover:text-gray-500'
              }`}
            >
              CUSTOMER
            </button>
            <button 
              onClick={() => handleTabChange('OWNER')}
              className={`pb-4 text-[13px] md:text-[14px] font-bold tracking-[0.2em] transition-all ${
                activeTab === 'OWNER' 
                ? 'text-gray-900 border-b-2 border-[#ff0b01]' 
                : 'text-gray-300 hover:text-gray-500'
              }`}
            >
              OWNER
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-5 bg-red-50 text-red-600 text-base rounded-2xl border border-red-100 animate-pulse shadow-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <img src={mobileIcon} alt="User" className="w-[22px] h-[22px] opacity-40" />
              </div>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username / Phone" 
                required
                className="w-full pl-16 pr-6 py-5 bg-[#fafafa] border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] focus:ring-4 focus:ring-[#ff0b01]/5 transition-all placeholder-gray-400" 
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <img src={passwordIcon} alt="Lock" className="w-[22px] h-[22px] opacity-40" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password" 
                required
                className="w-full pl-16 pr-16 py-5 bg-[#fafafa] border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] focus:ring-4 focus:ring-[#ff0b01]/5 transition-all placeholder-gray-400" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-[#ff0b01] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[12px] rounded-2xl transition-all mt-6 shadow-2xl flex items-center justify-center gap-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 active:translate-y-0'}`}
            >
              {loading && (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          {/* Login Options & Help */}
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-6 h-6 text-[#ff0b01] border-gray-300 rounded focus:ring-[#ff0b01] accent-[#ff0b01] cursor-pointer" 
              />
              <label htmlFor="remember" className="text-[14px] text-gray-400 cursor-pointer">
                Remember me next time
              </label>
            </div>
            
            <div className="text-[14px] space-y-3">
              <a href="#" className="text-[#ff0b01] font-bold block hover:underline">Forgot Password?</a>
              <p className="text-gray-400">
                Don't have account? <Link to="/register" className="text-[#ff0b01] font-extrabold hover:underline ml-2">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Side - Full Screen Cover */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative bg-gray-100 h-screen">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={rightBackground} 
            alt="Professional looking at tablet" 
            className="w-full h-full object-cover"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#8a1a16]/90 via-[#8a1a16]/20 to-transparent"></div>
          
          {/* Full-screen impact text */}
          <div className="absolute bottom-20 left-20 text-white max-w-lg" data-aos="fade-up" data-aos-delay="500">
            <h2 className="text-5xl font-bold mb-4 leading-tight">Elevate Your Salon Experience.</h2>
            <p className="text-xl text-white/80 font-medium tracking-wide">The ultimate platform for professionals and beauty enthusiasts.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerLogin;