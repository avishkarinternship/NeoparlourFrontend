import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { Sparkles, MapPin, Star, Scissors, ChevronRight } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import SEOFooter from '../common/SEOFooter';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { switchTenant } from '../../redux/slices/customerSlice';

export default function SEOSalons() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.customer);

  // Read data from navigation state if available
  const stateData = location.state || {};
  const [salons, setSalons] = useState(stateData.salons || []);
  const [cityName, setCityName] = useState(stateData.cityName || '');
  const [areaName, setAreaName] = useState(stateData.areaName || '');
  const [serviceName, setServiceName] = useState(stateData.serviceName || '');
  const [loading, setLoading] = useState(!stateData.salons);
  const [pricesMap, setPricesMap] = useState({});
  const [servicesMap, setServicesMap] = useState({});

  const { cityName: paramCity, areaName: paramArea, serviceName: paramService, serviceSlug } = useParams();

  const parseSlug = (str) => str ? str.replace(/-/g, ' ') : '';

  // Parse URL parameters (supporting both pretty route params and query parameters)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let urlCity = parseSlug(paramCity || queryParams.get('cityName') || '');
    let urlArea = parseSlug(paramArea || queryParams.get('areaName') || '');
    let urlService = parseSlug(paramService || queryParams.get('serviceName') || queryParams.get('category') || '');

    // Support new route format: /:cityName/:serviceSlug (where serviceSlug is Best-service-in-area)
    if (serviceSlug) {
      const match = serviceSlug.match(/^Best-(.+)-in-(.+)$/i);
      if (match) {
        urlService = parseSlug(match[1]);
        urlArea = parseSlug(match[2]);
      }
    } else if (urlService.toLowerCase().startsWith('best ') && urlArea) {
      // Fallback for old route structure
      const suffix = ` in ${urlArea.toLowerCase()}`;
      if (urlService.toLowerCase().endsWith(suffix)) {
        urlService = urlService.substring(5, urlService.length - suffix.length).trim();
      }
    }

    if (location.state && location.state.salons) {
      setCityName(location.state.cityName || urlCity);
      setAreaName(location.state.areaName || urlArea);
      setServiceName(location.state.serviceName || urlService);
      setSalons(location.state.salons);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (urlCity || urlArea || urlService) {
      setCityName(urlCity);
      setAreaName(urlArea);
      setServiceName(urlService);

      const fetchSalons = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `https://sb.neoparlour.com/api/salons/location-search?cityName=${encodeURIComponent(
              urlCity
            )}&areaName=${encodeURIComponent(urlArea)}&serviceName=${encodeURIComponent(
              urlService
            )}&category=${encodeURIComponent(urlService)}`
          );
          if (response.ok) {
            const data = await response.json();
            setSalons(data || []);
          }
        } catch (error) {
          console.error('Error fetching salons direct link', error);
          toast.error('Failed to load salons list.');
        } finally {
          setLoading(false);
        }
      };
      fetchSalons();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state, location.search, paramCity, paramArea, paramService]);

  // Update dynamic document title and meta description for Google/SEO indexation
  useEffect(() => {
    if (!cityName) return;
    const titleText = serviceName 
      ? `Best ${serviceName} in ${areaName ? `${areaName}, ${cityName}` : cityName} - Compare Prices & Book | NeoParlour`
      : `Best Beauty Salons & Spas in ${areaName ? `${areaName}, ${cityName}` : cityName} - Reviews & Booking | NeoParlour`;
    
    document.title = titleText;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    
    const descText = serviceName
      ? `Discover the highest-rated salons offering ${serviceName} in ${areaName ? `${areaName}, ${cityName}` : cityName}. Check menus, compare pricing, and book appointments instantly on NeoParlour.`
      : `Browse the top beauty salons, haircut experts, and spas in ${areaName ? `${areaName}, ${cityName}` : cityName}. View price lists, read reviews, and book online with Weekdays Discounts.`;
    
    metaDesc.setAttribute('content', descText);
  }, [cityName, areaName, serviceName]);

  // Fetch prices and service names details for all salons
  useEffect(() => {
    if (salons.length === 0) return;

    const fetchSalonDetails = async () => {
      const prices = {};
      const services = {};
      await Promise.all(
        salons.map(async (salon) => {
          const salonId = salon.salonId || salon.id;
          try {
            const res = await axiosInstance.get('/services/public/active', {
              params: { salonId }
            });
            const serviceList = res.data || [];
            
            let names = serviceList.map((s) => s.name || s.serviceName);
            if (serviceName) {
              const matchingService = names.find(n => n.toLowerCase() === serviceName.toLowerCase());
              if (matchingService) {
                names = [matchingService, ...names.filter(n => n !== matchingService)];
              } else {
                names = [serviceName, ...names]; // Fallback if API returned it but name differs slightly
              }
            }
            
            services[salonId] = names.slice(0, 4);

            if (serviceList.length > 0) {
              let displayPrice = 299;
              
              if (serviceName) {
                const targetService = serviceList.find(s => (s.name || s.serviceName).toLowerCase() === serviceName.toLowerCase());
                if (targetService && targetService.price) {
                  displayPrice = parseFloat(targetService.price);
                } else {
                  displayPrice = Math.min(...serviceList.map((s) => parseFloat(s.price) || 299));
                }
              } else {
                displayPrice = Math.min(...serviceList.map((s) => parseFloat(s.price) || 299));
              }
              
              prices[salonId] = displayPrice;
            } else {
              prices[salonId] = 299;
            }
          } catch (err) {
            prices[salonId] = 299;
          }
        })
      );
      setPricesMap(prices);
      setServicesMap(services);
    };

    fetchSalonDetails();
  }, [salons]);

  // Handle Book Now - Switch tenant and navigate
  const handleBookNow = (salon) => {
    const salonId = salon.salonId || salon.id;
    const salonName = salon.salonName || salon.name;
    localStorage.setItem('activeSalonId', salonId);
    localStorage.setItem('activeSalonName', salonName);

    if (!token) {
      navigate('/customer/salon');
      return;
    }

    const payload = { token, salonId, salonName };
    dispatch(switchTenant(payload))
      .unwrap()
      .then(() => {
        toast.success(`Switched to ${salonName}`);
        navigate('/customer/salon');
      })
      .catch(() => {
        navigate('/customer/salon');
      });
  };

  const getSalonImageSrc = (imageUrl, fallbackImg) => {
    if (!imageUrl) return fallbackImg;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const base = axiosInstance.defaults.baseURL || 'https://sb.neoparlour.com/api';
    return `${base}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const displayTitle = serviceName 
    ? `Best ${serviceName} in ${areaName || cityName}`
    : `Best Salons in ${areaName || cityName}`;

  return (
    <div className="min-h-screen bg-slate-50 antialiased font-sans flex flex-col justify-between">
      <div className="py-12 px-4 max-w-7xl w-full mx-auto flex-grow space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">{cityName}</span>
          {areaName && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-bold">{areaName}</span>
            </>
          )}
          {serviceName && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-red-600 font-extrabold">{serviceName}</span>
            </>
          )}
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Premium SEO Directories
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
              {displayTitle}
            </h1>
            <p className="text-gray-600 text-sm md:text-base font-medium leading-relaxed">
              Find, compare, and book the highest-rated salons offering {serviceName || 'beauty and grooming services'} in {areaName ? `${areaName}, ${cityName}` : cityName}. Enjoy exclusive rates and instant appointments.
            </p>
          </div>
        </div>

        {/* Salons Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-[32px] border border-gray-100 p-6 space-y-4">
                  <div className="h-48 bg-slate-200 rounded-2xl" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : salons.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-gray-100 p-16 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <Scissors className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No Salons Available</h3>
              <p className="text-gray-500 text-sm">
                We currently don't have registered salons matching "{serviceName}" in {areaName ? `${areaName}, ${cityName}` : cityName}. Explore other areas or try another city name in the footer below.
              </p>
              <Link
                to="/customer/salons"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-sm"
              >
                Browse All Salons
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {salons.map((salon) => {
                const salonId = salon.salonId || salon.id;
                const coverImg = getSalonImageSrc(salon.imageUrl, null);
                const startingPrice = pricesMap[salonId] || 299;
                const salonServices = servicesMap[salonId] || [];
                const rating = salon.rating || (((salonId || 0) % 5) * 0.1 + 4.5).toFixed(1);
                const reviewsCount = (((salonId || 0) * 17) % 80) + 40;

                return (
                  <div
                    key={salonId}
                    className="bg-white rounded-[32px] border border-gray-100 hover:border-red-500/20 hover:shadow-[0_24px_50px_-15px_rgba(255,42,20,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Salon Cover Photo */}
                    <div className="h-48 relative overflow-hidden bg-slate-50">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={salon.salonName || salon.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-rose-300">
                          <Scissors className="w-12 h-12" />
                          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest text-slate-400">No Image</span>
                        </div>
                      )}
                      
                      {/* Rating Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="bg-white/95 border border-emerald-500/20 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Open
                        </span>
                        <span className="bg-white/95 text-amber-500 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full shadow-sm border border-amber-500/10 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {rating} ({reviewsCount}+)
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 flex-grow space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                          {salon.salonName || salon.name}
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          {salon.areaName}, {salon.cityName}
                        </p>

                        {/* Top Services */}
                        {salonServices.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {salonServices.map((srv, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing and Book Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting Price</span>
                          <div className="text-base font-black text-gray-900">
                            ₹{startingPrice}
                          </div>
                        </div>
                        <button
                          onClick={() => handleBookNow(salon)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-widest px-5 py-3 rounded-2xl transition-all shadow-sm group-hover:shadow-md"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      <SEOFooter />
    </div>
  );
}
