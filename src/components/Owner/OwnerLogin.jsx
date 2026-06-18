import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginOwner, clearOwnerStaffError } from '../../redux/slices/ownerStaffSlice';
import { User, Lock, Sparkles, AlertCircle } from 'lucide-react';

// Using existing assets
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import rightBackground from '../../assets/CustomerLogin/right_background.jpg';

const OwnerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pulling state from ownerStaff slice
  const { loading, error } = useSelector((state) => state.ownerStaff);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    dispatch(clearOwnerStaffError());

    // Load saved owner/staff credentials if present
    const savedUsername = localStorage.getItem('neoparlour_owner_remembered_username');
    const savedPassword = localStorage.getItem('neoparlour_owner_remembered_password');
    if (savedUsername && savedPassword) {
      setFormData({
        username: savedUsername,
        password: savedPassword
      });
      setRememberMe(true);
    }
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginOwner(formData)).unwrap().then(() => {
      // Save or clear credentials based on rememberMe status
      if (rememberMe) {
        localStorage.setItem('neoparlour_owner_remembered_username', formData.username);
        localStorage.setItem('neoparlour_owner_remembered_password', formData.password);
      } else {
        localStorage.removeItem('neoparlour_owner_remembered_username');
        localStorage.removeItem('neoparlour_owner_remembered_password');
      }
      navigate('/owner/dashboard');
    });
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* Left Form Side - Full Height */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col items-center justify-center py-12 md:py-16 px-8 sm:px-16 lg:px-20 bg-white z-10">
        <div className="w-full max-w-[420px]" data-aos="fade-right" data-aos-delay="200">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-10 justify-center lg:justify-start">
            <img src={logoIcon} alt="NeoParlour Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">NeoParlour</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#ff0b01]/80 uppercase mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Management Portal
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">
              Owner & Staff Login
            </h2>
            <p className="text-gray-400 font-medium text-xs">
              Sign in to manage your salon's dashboard, bookings, and services.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-2xl border border-red-100 shadow-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                <User className="w-5 h-5 stroke-[2]" />
              </div>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username / Mobile" 
                required
                className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                <Lock className="w-5 h-5 stroke-[2]" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password" 
                required
                className="w-full pl-14 pr-10 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#ff0b01] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all mt-4 shadow-xl flex items-center justify-center gap-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          {/* Login Options & Help */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-[#ff0b01] border-gray-300 rounded focus:ring-[#ff0b01] accent-[#ff0b01] cursor-pointer" 
              />
              <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer font-bold">
                Remember me next time
              </label>
            </div>
            
            <div className="text-xs space-y-2 border-t pt-4">
              <a href="#" className="text-[#ff0b01] font-bold block hover:underline">Forgot Password?</a>
              <p className="text-gray-400 font-semibold">
                Are you a Customer? <Link to="/customer/login" className="text-[#ff0b01] font-black hover:underline ml-1.5">Customer Login</Link>
              </p>
              <p className="text-gray-400 font-semibold">
                New Salon Partner? <Link to="/owner/register" className="text-[#ff0b01] font-black hover:underline ml-1.5">Register Salon</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Side - Full Screen Cover */}
      <div className="hidden lg:block lg:flex-1 relative bg-gray-100 h-screen overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={rightBackground} 
            alt="Professional looking at tablet" 
            className="w-full h-full object-cover scale-105"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#8a1a16]/95 via-[#8a1a16]/50 to-transparent"></div>
          
          {/* Full-screen impact text */}
          <div className="absolute bottom-20 left-20 text-white max-w-lg" data-aos="fade-up" data-aos-delay="500">
            <h2 className="text-5xl font-black mb-4 leading-tight tracking-tighter">Elevate Your Salon Experience.</h2>
            <p className="text-lg text-white/80 font-medium tracking-wide leading-relaxed">The ultimate platform for professionals and beauty enthusiasts.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OwnerLogin;
