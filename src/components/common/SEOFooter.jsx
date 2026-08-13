import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';
import searchService from '../../services/searchService';
import { useDarkMode } from '../../context/DarkModeContext';

export default function SEOFooter() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  // 1. Major metropolitan and important Indian cities
  const cities = [
    'Pune', 'Mumbai', 'Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 
    'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Nagpur', 
    'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Ludhiana', 'Agra',
    'Chandigarh', 'Kochi', 'Coimbatore', 'Vizag', 'Guwahati', 'Mysore', 'Bhubaneswar', 'Raipur'
  ];

  const [selectedCity, setSelectedCity] = useState('Pune');
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('Kothrud');
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [clickingLink, setClickingLink] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAllCitiesMobile, setShowAllCitiesMobile] = useState(false);

  const sliderRef = useRef(null);

  const handleSlide = (direction) => {
    if (sliderRef.current) {
      const clientWidth = sliderRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.85 : clientWidth * 0.85;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Curated list of high-traffic, SEO-optimized main areas for all metropolitan cities (as fallbacks)
  const cityAreas = {
    'pune': [
      'Kothrud', 'Baner', 'Wakad', 'Aundh', 'Hinjewadi', 'Hinjawadi', 'Hinjawadi Phase 1', 'Hinjawadi Phase 2', 'Viman Nagar', 'Koregaon Park', 
      'Hadapsar', 'Kalyani Nagar', 'Katraj', 'Bibwewadi', 'Swargate', 'Chinchwad', 
      'Pimple Saudagar', 'Senapati Bapat Road', 'Magarpatta City', 'Bavdhan', 'Warje', 
      'Karvenagar', 'Paud Road', 'NIBM Road', 'Kondhwa', 'Undri', 'Pisoli', 'Mohammadwadi', 
      'Salunke Vihar', 'Wagholi', 'Talegaon Dabhade', 'Ravet', 'Punawale', 'Tathawade', 
      'Bhosari', 'Dhankawadi', 'Sahakar Nagar', 'Mukund Nagar', 'Deccan Gymkhana', 
      'FC Road', 'JM Road', 'Bhugaon', 'Pirangut', 'Balewadi'
    ],
    'mumbai': [
      'Bandra West', 'Andheri West', 'Juhu', 'Colaba', 'Worli', 'Lower Parel', 'Powai', 
      'Mulund', 'Ghatkopar West', 'Nariman Point', 'Marine Lines', 'Churchgate', 
      'Versova', 'Bandra East', 'Andheri East', 'Khar West', 'Santacruz West', 
      'Vile Parle West', 'Goregaon West', 'Malad West', 'Kandivali West', 'Borivali West', 
      'Chembur', 'Thane West', 'Vashi', 'Nerul', 'Dadar East', 'Dadar West',
      'Cuffe Parade', 'Malabar Hill', 'Breach Candy', 'Kemps Corner', 'Pedder Road',
      'Altamount Road', 'Nepean Sea Road', 'Mahalaxmi', 'Byculla', 'Prabhadevi',
      'Parel', 'Charni Road', 'Girgaon', 'Walkeshwar', 'Lokhandwala', 'Seven Bungalows',
      'Four Bungalows', 'Yari Road', 'Vile Parle East', 'Khar East', 'Santacruz East',
      'Goregaon East', 'Malad East', 'Kandivali East', 'Borivali East', 'Dahisar',
      'Kurla', 'Ghatkopar East', 'Mulund East', 'Bhandup', 'Kanjurmarg', 'Vikhroli',
      'Sion', 'Matunga', 'Wadala', 'Mazgaon', 'Fort', 'Kalbadevi', 'Grant Road',
      'Tardeo', 'Mumbai Central', 'Pali Hill', 'Carmichael Road'
    ],
    'bangalore': [
      'Koramangala', 'Indiranagar', 'Whitefield', 'Marathahalli', 'Bellandur', 'Sarjapur Road', 
      'Electronic City', 'HSR Layout', 'JP Nagar', 'Jayanagar', 'MG Road', 'Brigade Road', 
      'Lavelle Road', 'Residency Road', 'Ulsoor', 'Domlur', 'Old Airport Road', 'Kadugodi', 
      'Hoodi', 'KR Puram', 'Mahadevapura', 'CV Raman Nagar', 'Banaswadi', 'Ramamurthy Nagar', 
      'Yelahanka', 'Hebbal', 'Jakkur', 'Thanisandra', 'Nagawara', 'Manyata Tech Park', 
      'Bannerghatta Road', 'Arekere', 'Gottigere', 'Kanakapura Road', 'Basavanagudi', 
      'Banashankari', 'Malleshwaram', 'Rajajinagar', 'BTM Layout', 'Sadashivanagar',
      'Palace Road', 'Cunningham Road', 'Sankey Road', 'Langford Town', 'Langford Gardens',
      'Ashok Nagar', 'Vittal Mallya Road'
    ],
    'chennai': [
      'Adyar', 'Velachery', 'T Nagar', 'Nungambakkam', 'Anna Nagar', 'Mylapore', 'OMR', 
      'Tambaram', 'Besant Nagar', 'Guindy', 'Chromepet', 'Royapettah', 'Egmore', 'Alwarpet',
      'Boat Club Road', 'Poes Garden', 'Gopalapuram', 'Abhiramapuram', 'Luz', 'Neelankarai',
      'Injambakkam', 'Sterling Road', 'Haddows Road'
    ],
    'delhi': [
      'Connaught Place', 'Saket', 'Karol Bagh', 'Vasant Kunj', 'Rajouri Garden', 'Dwarka', 
      'Greater Kailash', 'Lajpat Nagar', 'South Extension', 'Hauz Khas', 'Green Park', 
      'Defence Colony', 'Rohini', 'Pitampura', 'Mayur Vihar', 'Jor Bagh', 'Golf Links', 
      'Shanti Niketan', 'Vasant Vihar', 'Panchsheel Park', 'Gulmohar Park', 'Prithviraj Road', 
      'Aurangzeb Road'
    ],
    'hyderabad': [
      'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Kondapur', 'Begumpet', 
      'Secunderabad', 'Ameerpet', 'Kukatpally', 'Hitech City', 'Somajiguda', 'Miyapur', 
      'Dilshukhnagar', 'Manikonda', 'Red Hills', 'Forest Hills', 'Srinagar Colony', 
      'Tellapur', 'Nanakramguda', 'Financial District'
    ],
    'kolkata': [
      'Salt Lake', 'Park Street', 'New Town', 'Gariahat', 'Ballygunge', 'Tollygunge', 
      'Howrah', 'Dum Dum', 'Behala', 'Lake Town', 'Shyambazar', 'Alipore', 'Jadavpur', 
      'Elgin Road', 'Loudon Street', 'Minto Park', 'Harrington Street', 'Wood Street', 
      'Camac Street', 'Beck Bagan', 'Prince Anwar Shah Road'
    ],
    'ahmedabad': [
      'Satellite', 'C G Road', 'Bodakdev', 'Prahlad Nagar', 'Vastrapur', 'Naranpura', 
      'Ghatlodia', 'Maninagar', 'Navrangpura', 'Ellisbridge', 'Bopal', 'Gurukul', 
      'Thaltej', 'Drive In Road', 'Law Garden', 'Ashram Road', 'Khanpur', 'Shahibaug', 
      'Paldi', 'Memnagar', 'Anand Nagar', 'S G Highway'
    ],
    'surat': [
      'Adajan', 'Varachha', 'Vesu', 'Piplod', 'Katargam', 'Ghod Dod Road', 'Rander', 
      'Udhna', 'New City Light', 'Athwa Lines', 'Dumbhal', 'Sarthana', 'Pal', 'Althan', 
      'Bharthana', 'Canal Road', 'Parle Point', 'City Light', 'VIP Road', 'Majura Gate', 
      'Nanpura', 'Adajan Patiya', 'Anand Mahal Road'
    ],
    'jaipur': [
      'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C Scheme', 'Raja Park', 'Tonk Road', 
      'Jagatpura', 'Bani Park', 'Lalkothi', 'Civil Lines', 'Sodala', 'Shastri Nagar', 
      'Adarsh Nagar', 'Bhawani Singh Road', 'Tilak Marg', 'Prithviraj Road', 'Ashok Nagar', 
      'Sardar Patel Marg', 'Bapu Nagar'
    ],
    'lucknow': [
      'Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Aminabad', 'Charbagh', 
      'Jankipuram', 'Mahanagar', 'Ashiyana', 'Vikas Nagar', 'Chowk', 'Naka Hindola', 
      'LDA Colony', 'SGPGI Area', 'Faizabad Road', 'Sushant Golf City', 'Butler Road', 
      'Riva Road', 'Nishatganj', 'Lalbagh'
    ],
    'nagpur': [
      'Dharampeth', 'Sadar', 'Ramdaspeth', 'Pratap Nagar', 'Manish Nagar', 'Civil Lines', 
      'Wardha Road', 'Narendra Nagar', 'Sitabuldi', 'Trimurti Nagar', 'Khamla', 'Ravi Nagar', 
      'Shankar Nagar', 'Giripeth', 'Lokmat Square', 'Law College Square', 'Kalmana', 'Hingna'
    ],
    'indore': [
      'Vijay Nagar', 'Palasia', 'Rajendra Nagar', 'LIG Colony', 'Khajrana', 'Sudama Nagar', 
      'Annapurna Road', 'Sapna Sangeeta', 'Bhavarkua', 'MG Road', 'New Palasia', 'Old Palasia', 
      'Nihalpur Mundi', 'Manishpuri', 'Geeta Bhawan', 'Race Course Road', 'South Tukoganj'
    ],
    'bhopal': [
      'Arera Colony', 'MP Nagar', 'TT Nagar', 'Kolar Road', 'Indrapuri', 'Saket Nagar', 
      'Gulmohar', 'Govindpura', 'Bairagarh', 'Ayodhya Bypass', 'Shivaji Nagar', 'Habibganj', 
      'DB City', 'Piplani', 'Berasia Road', 'Airport Road', 'New Market'
    ],
    'patna': ['Boring Road', 'Kankarbagh', 'Bailey Road', 'Patliputra Colony', 'Rajendra Nagar', 'Dak Bungalow Road', 'Anisabad', 'Fraser Road', 'Mahendru', 'Danapur'],
    'vadodara': ['Alkapuri', 'Gotri', 'Vasna Road', 'Manjalpur', 'Sayajigunj', 'Akota', 'Karelibaug', 'Fatehgunj', 'Subhanpura', 'Waghodia Road'],
    'ludhiana': ['Sarabha Nagar', 'Model Town', 'Ferozepur Road', 'BRS Nagar', 'Civil Lines', 'Pakhowal Road', 'Gill Road', 'Sundar Nagar', 'Samrala Road'],
    'agra': ['Sanjay Place', 'Tajganj', 'Dayalbagh', 'Kamla Nagar', 'Fatehabad Road', 'Shastri Puram', 'Sikandra', 'Sadat Bazar', 'MG Road'],
    'chandigarh': [
      'Sector 8', 'Sector 9', 'Sector 10', 'Sector 11', 'Sector 35', 
      'Phase 3B2 Mohali', 'Phase 5 Mohali', 'Phase 7 Mohali', 'Sector 15 Mohali', 'Sector 70 Mohali', 
      'Sector 6 Panchkula', 'Sector 7 Panchkula', 'Sector 8 Panchkula', 'MDC Panchkula'
    ],
    'kochi': [
      'Panampilly Nagar', 'Marine Drive', 'Kadavanthra', 'Edappally', 'Kakkanad', 
      'Fort Kochi', 'Mattancherry', 'Vyttila', 'Thevara', 'Aluva', 'Kaloor', 'Palarivattom'
    ],
    'coimbatore': [
      'R S Puram', 'Race Course', 'Peelamedu', 'Gandhipuram', 'Saibaba Colony', 
      'Ramanathapuram', 'Saravanampatti', 'Singanallur', 'Vadavalli', 'Kovaipudur'
    ],
    'vizag': [
      'Waltair Uplands', 'Siripuram', 'MVP Colony', 'Beach Road', 'Pandurangapuram', 
      'Seethammadhara', 'Madhurawada', 'Gajuwaka', 'Kancharapalem', 'Dwaraka Nagar'
    ],
    'guwahati': [
      'Christian Basti', 'G S Road', 'Zoo Road', 'Ganeshguri', 'Pan Bazar', 
      'Paltan Bazar', 'Beltola', 'Hatigaon', 'Kahilipara', 'Silpukhuri'
    ],
    'mysore': [
      'Gokulam', 'Jayalakshmipuram', 'V V Mohalla', 'Siddhartha Layout', 'J P Nagar', 
      'Vijayanagar', 'Kuilapalayam', 'Devaraja Mohalla', 'Saraswathipuram'
    ],
    'bhubaneswar': [
      'Kharvela Nagar', 'Saheed Nagar', 'Nayapalli', 'Patia', 'Jayadev Vihar', 
      'Chandrasekharpur', 'Khandagiri', 'Unit 6', 'Forest Park', 'Brahmeswarpatna'
    ],
    'raipur': [
      'Shankar Nagar', 'Sadar Bazar', 'Devendra Nagar', 'Samta Colony', 'Tatibandh', 
      'VIP Road', 'Pandri', 'Civil Lines', 'Katora Talab', 'Pachpedi Naka'
    ]
  };

  // Helper to resolve different Nominatim queries per page click to bypass cache/offset limits
  const getQueryForPage = (city, pageNum) => {
    const queries = {
      'pune': [
        'suburbs in Pune, India',
        'localities in Pune, India',
        'suburbs in Pimpri-Chinchwad, India',
        'places in Pune, India'
      ],
      'mumbai': [
        'suburbs in Mumbai, India',
        'localities in Mumbai, India',
        'neighbourhoods in Mumbai, India',
        'places in Mumbai, India'
      ],
      'bangalore': [
        'suburbs in Bangalore, India',
        'localities in Bangalore, India',
        'neighbourhoods in Bangalore, India',
        'places in Bangalore, India'
      ],
      'chennai': [
        'suburbs in Chennai, India',
        'localities in Chennai, India',
        'neighbourhoods in Chennai, India',
        'places in Chennai, India'
      ],
      'delhi': [
        'suburbs in Delhi, India',
        'localities in Delhi, India',
        'neighbourhoods in Delhi, India',
        'places in Delhi, India'
      ],
      'hyderabad': [
        'suburbs in Hyderabad, India',
        'localities in Hyderabad, India',
        'neighbourhoods in Hyderabad, India',
        'places in Hyderabad, India'
      ]
    };

    const cityKey = city.toLowerCase();
    const cityQueries = queries[cityKey] || [
      `suburbs in ${city}, India`,
      `localities in ${city}, India`,
      `neighbourhoods in ${city}, India`,
      `places in ${city}, India`
    ];

    return {
      queryString: cityQueries[pageNum % cityQueries.length],
      isLast: pageNum >= cityQueries.length - 1
    };
  };

  // Fetch areas of the selected city dynamically from Nominatim with a static fallback
  const fetchCityAreas = async (city, pageNum, append = false) => {
    if (pageNum === 0) {
      setLoadingAreas(true);
    } else {
      setLoadingMore(true);
    }

    const fallback = cityAreas[city.toLowerCase()] || [];

    try {
      const { queryString, isLast } = getQueryForPage(city, pageNum);
      const limit = 50;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryString)}&format=json&limit=${limit}`,
        {
          headers: {
            'User-Agent': 'NeoParlourApp/2.0 (support@neopaceinfotech.com)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          let parsedAreas = data
            .filter(item => item.class === 'place' && (item.type === 'suburb' || item.type === 'neighbourhood' || item.type === 'quarter' || item.type === 'village' || item.type === 'locality'))
            .map(item => item.display_name.split(',')[0].trim());

          const subpartKeywords = [
            'depo', 'deppo', 'stand', 'stop', 'hospital', 'station', 'shop', 'salon', 
            'lane', 'society', 'apartment', 'complex', 'mall', 'plaza', 'garden', 'hotel', 'restaurant', 
            'cafe', 'school', 'college', 'temple', 'church', 'mosque', 'metro', 'library', 'bank', 'atm', 
            'clinic', 'market', 'bus', 'junction', 'railway', 'airport', 'police', 'post', 'office', 
            'court', 'academy', 'institute', 'university', 'bridge', 'flyover', 'chowk', 'lake', 'fort', 
            'palace', 'museum', 'zoo', 'stadium', 'industrial', 'service', 'center', 'centre', 'showroom', 
            'gym', 'club', 'fitness', 'theatre', 'cinema', 'multiplex', 'building', 'tower', 'villa', 
            'residency', 'house', 'home', 'hill', 'gate', 'justbooks', 'tcs', 'infosys', 'wipro', 'cognizant'
          ];

          parsedAreas = parsedAreas.filter(name => {
            if (!name) return false;
            if (name.toLowerCase() === city.toLowerCase()) return false;
            
            const lowerName = name.toLowerCase();
            const hasPoi = subpartKeywords.some(keyword => lowerName.includes(keyword));
            if (hasPoi) return false;

            // Keep names clean and short (allow up to 3 words for names like "Manyata Tech Park" or "Senapati Bapat Road")
            if (name.split(/\s+/).length > 3) return false;

            return true;
          });

          parsedAreas = Array.from(new Set(parsedAreas));

          setAreas(prev => {
            const combined = append 
              ? [...prev, ...parsedAreas] 
              : (pageNum === 0 ? [...fallback, ...parsedAreas] : parsedAreas);
            const uniqueCombined = Array.from(new Set(combined));
            if (pageNum === 0 && uniqueCombined.length > 0) {
              setSelectedArea(uniqueCombined[0]);
            }
            return uniqueCombined;
          });
          setHasMore(!isLast && data.length >= 10);
          return;
        }
      }
      
      // Fallback if Nominatim failed or returned no results
      if (pageNum === 0) {
        setAreas(fallback);
        setSelectedArea(fallback[0]);
        setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching city areas via Nominatim:', error);
      if (pageNum === 0) {
        setAreas(fallback);
        setSelectedArea(fallback[0]);
        setHasMore(false);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingAreas(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchCityAreas(selectedCity, 0, false);
  }, [selectedCity]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCityAreas(selectedCity, nextPage, true);
  };

  // 9 categories and their services
  const serviceCategories = [
    {
      categoryName: 'Hair Services',
      services: [
        'Hair Cut', 'Hair Styling', 'Hair Wash', 'Blow Dry', 'Hair Coloring',
        'Highlights', 'Hair Spa', 'Hair Treatment', 'Keratin Treatment',
        'Hair Smoothening', 'Hair Straightening', 'Curling', 'Hair Extensions'
      ]
    },
    {
      categoryName: 'Skin Care',
      services: [
        'Facial', 'Cleanup', 'Skin Polishing', 'Bleaching', 'De-Tan Treatment',
        'Face Treatment', 'Anti-Aging Treatment', 'Acne Treatment', 'Skin Brightening Treatment'
      ]
    },
    {
      categoryName: 'Hair Removal',
      services: [
        'Waxing', 'Threading', 'Eyebrow Shaping', 'Upper Lip', 'Forehead', 'Full Face Waxing', 'Full Body Waxing'
      ]
    },
    {
      categoryName: 'Nail Care',
      services: [
        'Manicure', 'Pedicure', 'Nail Cutting', 'Nail Shaping', 'Nail Art', 'Nail Extensions', 'Gel Polish'
      ]
    },
    {
      categoryName: 'Makeup',
      services: [
        'Party Makeup', 'Bridal Makeup', 'Engagement Makeup', 'Reception Makeup', 'HD Makeup', 'Basic Makeup'
      ]
    },
    {
      categoryName: 'Grooming',
      services: [
        'Beard Trim', 'Beard Styling', 'Shaving', 'Moustache Styling', 'Eyebrow Styling', 'Eyelash Services'
      ]
    },
    {
      categoryName: 'Spa & Massage',
      services: [
        'Head Massage', 'Body Massage', 'Relaxation Massage', 'Aroma Therapy', 'Body Scrub', 'Body Wrap'
      ]
    },
    {
      categoryName: 'Bridal Packages',
      services: [
        'Bridal Hair', 'Bridal Makeup', 'Bridal Facial', 'Bridal Manicure/Pedicure', 'Pre-Bridal Package'
      ]
    },
    {
      categoryName: 'Hair Treatment',
      services: [
        'Hair Fall Treatment', 'Dandruff Treatment', 'Scalp Treatment', 'Damage Repair', 'Protein Treatment'
      ]
    }
  ];

  // Call location search API and redirect on link click
  const handleLinkClick = async (e, cityName, areaName, serviceName) => {
    e.preventDefault();
    if (clickingLink) return;

    setClickingLink(true);
    const resolveToast = toast.loading(`Searching salons for ${serviceName} in ${areaName}...`);

    try {
      const response = await fetch(
        `https://sb.neoparlour.com/api/salons/location-search?cityName=${encodeURIComponent(
          cityName
        )}&areaName=${encodeURIComponent(areaName)}&serviceName=${encodeURIComponent(
          serviceName
        )}&category=${encodeURIComponent(serviceName)}`
      );

      if (response.ok) {
        const salonsList = await response.json();
        toast.success(`Found ${salonsList.length} salons!`, { id: resolveToast });
        
        const createSlug = (str) => encodeURIComponent(str.trim().toLowerCase().replace(/\s+/g, '-'));

        // Redirect to SEOSalons route, passing results in navigation state
        navigate(`/${createSlug(cityName)}/best-${createSlug(serviceName)}-in-${createSlug(areaName)}`, {
          state: {
            salons: salonsList,
            cityName,
            areaName,
            serviceName
          }
        });
      } else {
        toast.error('Could not fetch salons for this location.', { id: resolveToast });
      }
    } catch (error) {
      console.error('Error fetching salons on SEO link click', error);
      toast.error('Network error. Please try again.', { id: resolveToast });
    } finally {
      setClickingLink(false);
    }
  };

  return (
    <div className={`w-full py-6 px-6 md:px-12 font-sans border-t relative transition-colors duration-300 ${isDark ? 'bg-[#0a0a0c] text-gray-400 border-zinc-900' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {clickingLink && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className={`border rounded-3xl p-6 flex flex-col items-center gap-3 shadow-2xl transition-all ${isDark ? 'bg-zinc-900/90 border-zinc-800 text-white' : 'bg-white/90 border-gray-200 text-gray-900'}`}>
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Searching Best Salons...</span>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h2 className={`text-xl font-black tracking-wider uppercase flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            Local Beauty Salons & Spas Directory
          </h2>
          <p className={`text-xs max-w-2xl ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
            Browse static localized directories to discover premium salons, haircut experts, skin treatment clinics, bridal makeovers, and massage therapists near you. Select your city and area to start exploring.
          </p>
        </div>

        {/* City Selector */}
        <div className="space-y-4">
          <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Select City</h3>
          <div className={`flex flex-wrap items-center gap-2 pb-4 border-b ${isDark ? 'border-zinc-900' : 'border-gray-200'}`}>
            {(isMobile && !showAllCitiesMobile ? cities.slice(0, 8) : cities).map((city) => {
              const isActive = selectedCity === city;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`text-xs font-extrabold tracking-wider uppercase px-4 py-2 rounded-xl transition-all duration-200 border ${
                    isActive
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/10'
                      : isDark
                        ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {city}
                </button>
              );
            })}
            {isMobile && cities.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllCitiesMobile(!showAllCitiesMobile)}
                className="text-xs font-black uppercase text-red-500 hover:text-red-400 tracking-widest px-4 py-2 border border-dashed border-red-500/30 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-all duration-200"
              >
                {showAllCitiesMobile ? 'Show Less' : 'Load More'}
              </button>
            )}
          </div>
        </div>

        {/* Area Selector */}
        <div className="space-y-4">
          <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            Select Area in {selectedCity}
          </h3>

          {loadingAreas ? (
            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
              <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading available areas...
            </div>
          ) : (
            <div className="space-y-3">
              {/* Compact scrollable container to keep layout size small */}
              <div className={`max-h-36 md:max-h-48 overflow-y-auto pr-1 flex flex-wrap items-center gap-2 content-start border p-3 rounded-2xl ${isDark ? 'border-zinc-900/60 bg-zinc-950/20' : 'border-gray-200 bg-white/50'}`}>
                {areas.length === 0 ? (
                  <span className={`text-xs italic p-1 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>No areas available.</span>
                ) : (
                  areas.map((area) => {
                    const isActive = selectedArea === area;
                    return (
                      <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? isDark 
                              ? 'bg-zinc-800 text-red-400 border border-red-500/20 shadow-sm'
                              : 'bg-red-50 text-red-600 border border-red-200 shadow-sm'
                            : isDark
                              ? 'bg-zinc-900/20 border border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                              : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })
                )}
              </div>

              {hasMore && (
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className={`text-xs font-extrabold uppercase tracking-wider text-red-500 hover:text-red-600 transition-all duration-200 flex items-center gap-1.5 py-1.5 px-4 rounded-xl border shadow-md ${
                      isDark
                        ? 'disabled:text-zinc-600 bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 disabled:bg-zinc-900/20 shadow-black/10'
                        : 'disabled:text-gray-400 bg-white border-gray-200 hover:border-gray-300 disabled:bg-gray-50 shadow-black/5'
                    }`}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> Loading more suburbs...
                      </>
                    ) : (
                      <>Load More Suburbs of {selectedCity}</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories & Service Links Farm */}
        <div className={`pt-6 border-t ${isDark ? 'border-zinc-900' : 'border-gray-200'}`}>
          <div className={`flex items-center justify-between mb-2 pb-2 border-b ${isDark ? 'border-zinc-900/60' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              Popular Services in {selectedArea}, {selectedCity}
            </h3>
            {/* Sliding Navigation Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSlide('left')}
                className={`p-3 border rounded-full active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-lg ${
                  isDark
                    ? 'bg-zinc-950/80 border-zinc-800/85 hover:border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-label="Slide Left"
              >
                <ChevronRight className="w-4 h-4 transform rotate-180" />
              </button>
              <button 
                onClick={() => handleSlide('right')}
                className={`p-3 border rounded-full active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-lg ${
                  isDark
                    ? 'bg-zinc-950/80 border-zinc-800/85 hover:border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-label="Slide Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Responsive Horizontal Slider Container */}
          <div 
            ref={sliderRef} 
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none no-scrollbar gap-6 pb-6 w-full"
          >
            {serviceCategories.map((cat, index) => (
              <div 
                key={index} 
                className={`w-[78vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] shrink-0 snap-start border p-5 rounded-[28px] space-y-3 transition-all duration-300 ${
                  isDark
                    ? 'bg-zinc-900/10 border-zinc-900/60 hover:border-zinc-800 hover:bg-zinc-900/25'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <h4 className={`text-xs font-black uppercase tracking-[0.15em] border-l-[3px] border-red-600 pl-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {cat.categoryName}
                </h4>
                <ul className="space-y-1">
                  {cat.services.map((service, sIdx) => (
                    <li key={sIdx}>
                      <a
                        href={`/${encodeURIComponent(
                          selectedCity.trim().toLowerCase().replace(/\s+/g, '-')
                        )}/best-${encodeURIComponent(
                          service.trim().toLowerCase().replace(/\s+/g, '-')
                        )}-in-${encodeURIComponent(selectedArea.trim().toLowerCase().replace(/\s+/g, '-'))}`}
                        onClick={(e) => handleLinkClick(e, selectedCity, selectedArea, service)}
                        className={`hover:text-red-500 transition-colors duration-200 text-xs font-semibold flex items-center group py-0.5 ${isDark ? 'text-zinc-400' : 'text-gray-500 hover:text-red-600'}`}
                      >
                        <ChevronRight className="w-3 h-3 text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2 group-hover:ml-0 mr-1.5 shrink-0" />
                        {service} in {selectedArea}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>


      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}