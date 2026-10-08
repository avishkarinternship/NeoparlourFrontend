import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { getStateFromStateName, getStateFromCityName, getStateDisplayName, getCitiesForState } from '../constants/indianStates';

// Major Indian metropolitan clusters mapping a city name to its talukas, subdistricts, municipal corporations, and peripheral townships
export const CITY_METRO_CLUSTERS = {
  pune: [
    'pune', 'pmc', 'pcmc', 'pimpri', 'chinchwad', 'pimpri-chinchwad', 'pimpri chinchwad',
    'mulshi', 'haveli', 'mhalunge', 'maan', 'hinjawadi', 'hinjewadi', 'wakad', 'tathawade',
    'punawale', 'ravet', 'nigdi', 'akurdi', 'bhosari', 'chakan', 'talegaon',
    'bavdhan', 'kothrud', 'hadapsar', 'wagholi', 'kharadi', 'viman nagar', 'kalyani nagar',
    'baner', 'balewadi', 'aundh', 'pashan', 'katraj', 'dhankawadi', 'kondhwa', 'wanowrie',
    'bibwewadi', 'warje', 'sinhagad', 'dapodi', 'kasarwadi', 'sangvi', 'pimple saudagar',
    'pimple gurav', 'pimple nilakh', 'moshi', 'dighi', 'charholi', 'alandi', 'khadki', 'yerawada',
    'maval', 'shirur', 'bhor', 'velhe', 'purandar'
  ],
  mumbai: [
    'mumbai', 'bombay', 'mumbai suburban', 'mumbai city', 'navi mumbai', 'thane', 'kalyan',
    'dombivli', 'mira bhayandar', 'mira-bhayandar', 'vasai', 'virar', 'vasai-virar', 'panvel',
    'ulhasnagar', 'bhiwandi', 'ambernath', 'badlapur', 'kurla', 'andheri', 'bandra', 'borivali',
    'malad', 'goregaon', 'kandivali', 'ghatkopar', 'chembur', 'dadar', 'powai', 'uran', 'karjat', 'khopoli'
  ],
  bengaluru: [
    'bengaluru', 'bangalore', 'bengaluru urban', 'bengaluru rural', 'anekal', 'whitefield',
    'electronic city', 'yelahanka', 'krishnarajapura', 'kr puram', 'sarjapur', 'marathahalli',
    'bellandur', 'indiranagar', 'koramangala', 'jayanagar', 'jp nagar', 'hebbal', 'banashankari',
    'rajajinagar', 'malleswaram', 'hsr layout', 'btm layout', 'mahadevapura', 'bommanahalli',
    'kengeri', 'hoskote', 'devanahalli', 'nelamangala', 'magadi'
  ],
  delhi: [
    'delhi', 'new delhi', 'north delhi', 'south delhi', 'east delhi', 'west delhi', 'central delhi',
    'noida', 'greater noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad', 'manesar', 'bahadurgarh', 'sonipat'
  ],
  hyderabad: [
    'hyderabad', 'secunderabad', 'cyberabad', 'rangareddy', 'medchal', 'malkajgiri', 'shamshabad',
    'hitec city', 'madhapur', 'gachibowli', 'kondapur', 'kukatpally', 'jubilee hills', 'banjara hills',
    'ghatkesar', 'uppal', 'lb nagar', 'sangareddy', 'patancheru'
  ],
  kolkata: [
    'kolkata', 'calcutta', 'howrah', 'salt lake', 'bidhannagar', 'new town', 'rajarhat',
    'north 24 parganas', 'south 24 parganas', 'hooghly', 'barrackpore', 'dum dum', 'alipore', 'ballygunge'
  ],
  chennai: [
    'chennai', 'madras', 'tambaram', 'avadi', 'sholinganallur', 'omr', 'ecr', 'velachery',
    'guindy', 'anna nagar', 't nagar', 'adyar', 'mylapore', 'porur', 'chengalpattu', 'kanchipuram',
    'thiruvallur', 'pallavaram', 'chromepet', 'ambattur'
  ],
  ahmedabad: [
    'ahmedabad', 'gandhinagar', 'sanand', 'daskroi', 'bopal', 'sg highway', 'satellite', 'vastrapur', 'maninagar',
    'chandkheda', 'naroda', 'sarkhej', 'prahlad nagar', 'thaltej', 'bodakdev'
  ],
  chandigarh: [
    'chandigarh', 'mohali', 'sas nagar', 'panchkula', 'zirakpur', 'kharar', 'dera bassi', 'kalka', 'pinjore'
  ],
  jaipur: [
    'jaipur', 'sanganer', 'amer', 'mansarovar', 'vaishali nagar', 'malviya nagar', 'raja park',
    'c-scheme', 'vidhyadhar nagar', 'jagatpura', 'sitapura', 'jhotwara'
  ],
  lucknow: [
    'lucknow', 'gomti nagar', 'alambagh', 'indira nagar', 'hazratganj', 'mahanagar', 'ashiyana',
    'vikas nagar', 'jankipuram', 'chinhat', 'sushant golf city'
  ],
  kochi: [
    'kochi', 'cochin', 'ernakulam', 'kakkanad', 'aluva', 'tripunithura', 'fort kochi', 'kalamassery',
    'edappally', 'palarivattom', 'vyttila', 'mattancherry', 'kaloor'
  ],
  indore: [
    'indore', 'rau', 'vijay nagar', 'palasia', 'mhow', 'bhanwarkuan', 'ab road', 'bypass road', 'super corridor'
  ],
  surat: [
    'surat', 'adajan', 'vesu', 'varachha', 'katargam', 'rander', 'piplod', 'athwa', 'udhna', 'dindoli', 'pal'
  ],
  coimbatore: [
    'coimbatore', 'rs puram', 'gandhipuram', 'peelamedu', 'saravanampatti', 'saibaba colony', 'singanallur', 'ramanathapuram'
  ],
  visakhapatnam: [
    'visakhapatnam', 'vizag', 'gajuwaka', 'madhurawada', 'mvp colony', 'seethammadhara', 'dwaraka nagar', 'rushikonda', 'pendurthi'
  ],
  patna: [
    'patna', 'danapur', 'kankarbagh', 'boring road', 'bailey road', 'patliputra', 'rajendra nagar', 'phulwari sharif'
  ],
  nagpur: [
    'nagpur', 'dharampeth', 'sitabuldi', 'hingna', 'wadi', 'kamptee', 'wardhaman nagar', 'sadar', 'ramdaspeth', 'pratap nagar'
  ]
};

// Known other distinct districts to prevent highway cross-leakage
export const KNOWN_OTHER_DISTRICTS = {
  pune: [
    'ahmednagar', 'sangamner', 'nashik', 'sinnar', 'satara', 'solapur', 'kolhapur', 'sangli',
    'aurangabad', 'chhatrapati sambhajinagar', 'jalgaon', 'dhule', 'nandurbar', 'amravati',
    'nagpur', 'wardha', 'yavatmal', 'nanded', 'latur', 'osmanabad', 'dharashiv', 'beed',
    'parbhani', 'hingoli', 'jalna', 'buldhana', 'akola', 'washim', 'bhandara', 'gondia',
    'chandrapur', 'gadchiroli', 'raigad', 'ratnagiri', 'sindhudurg'
  ],
  mumbai: [
    'pune', 'nashik', 'raigad', 'ratnagiri', 'satara', 'ahmednagar', 'surat', 'valsad'
  ],
  bengaluru: [
    'mysuru', 'mysore', 'mandya', 'ramanagara', 'tumakuru', 'kolar', 'chikkaballapur', 'hassan', 'hosur'
  ],
  delhi: [
    'jaipur', 'alwar', 'meerut', 'agra', 'mathura', 'panipat', 'rohtak', 'sonipat'
  ],
  hyderabad: [
    'warangal', 'nizamabad', 'khammam', 'karimnagar', 'nalgonda', 'mahbubnagar', 'suryapet'
  ],
  chennai: [
    'coimbatore', 'madurai', 'tiruchirappalli', 'salem', 'tiruppur', 'erode', 'vellore', 'tirunelveli', 'villupuram'
  ],
  kolkata: [
    'durgapur', 'asansol', 'siliguri', 'bardhaman', 'kharagpur', 'malda', 'baharampur'
  ],
  ahmedabad: [
    'surat', 'vadodara', 'rajkot', 'bhavnagar', 'jamnagar', 'junagadh', 'anand', 'navsari', 'bharuch'
  ],
  chandigarh: [
    'ludhiana', 'amritsar', 'jalandhar', 'patiala', 'bathinda', 'ambala', 'karnal'
  ],
  jaipur: [
    'jodhpur', 'udaipur', 'kota', 'bikaner', 'ajmer', 'bhilwara', 'alwar', 'sikar'
  ],
  lucknow: [
    'kanpur', 'agra', 'varanasi', 'prayagraj', 'meerut', 'bareilly', 'aligarh', 'gorakhpur', 'jhansi'
  ],
  kochi: [
    'thiruvananthapuram', 'kozhikode', 'thrissur', 'kollam', 'palakkad', 'kannur', 'alappuzha', 'kottayam'
  ]
};

// Curated prime areas for instant matching & guaranteed coverage across major metros
export const METRO_PRIME_AREAS = {
  pune: [
    { name: 'Hinjawadi', district: 'Mulshi / PCMC', city: 'Pune' },
    { name: 'Hinjewadi Phase 1', district: 'Mulshi / PCMC', city: 'Pune' },
    { name: 'Hinjewadi Phase 2', district: 'Mulshi / PCMC', city: 'Pune' },
    { name: 'Hinjewadi Phase 3', district: 'Mulshi / PCMC', city: 'Pune' },
    { name: 'Wakad', district: 'PCMC', city: 'Pune' },
    { name: 'Baner', district: 'PMC', city: 'Pune' },
    { name: 'Balewadi', district: 'PMC', city: 'Pune' },
    { name: 'Aundh', district: 'PMC', city: 'Pune' },
    { name: 'Pashan', district: 'PMC', city: 'Pune' },
    { name: 'Bavdhan', district: 'PMC', city: 'Pune' },
    { name: 'Kothrud', district: 'PMC', city: 'Pune' },
    { name: 'Viman Nagar', district: 'PMC', city: 'Pune' },
    { name: 'Kalyani Nagar', district: 'PMC', city: 'Pune' },
    { name: 'Kharadi', district: 'PMC', city: 'Pune' },
    { name: 'Wagholi', district: 'PMC', city: 'Pune' },
    { name: 'Hadapsar', district: 'PMC', city: 'Pune' },
    { name: 'Magarpatta City', district: 'PMC', city: 'Pune' },
    { name: 'Amanora Park Town', district: 'PMC', city: 'Pune' },
    { name: 'Pimpri', district: 'PCMC', city: 'Pune' },
    { name: 'Chinchwad', district: 'PCMC', city: 'Pune' },
    { name: 'Nigdi', district: 'PCMC', city: 'Pune' },
    { name: 'Akurdi', district: 'PCMC', city: 'Pune' },
    { name: 'Ravet', district: 'PCMC', city: 'Pune' },
    { name: 'Tathawade', district: 'PCMC', city: 'Pune' },
    { name: 'Punawale', district: 'PCMC', city: 'Pune' },
    { name: 'Bhosari', district: 'PCMC', city: 'Pune' },
    { name: 'Moshi', district: 'PCMC', city: 'Pune' },
    { name: 'Chakan', district: 'Pune District', city: 'Pune' },
    { name: 'Katraj', district: 'PMC', city: 'Pune' },
    { name: 'Bibwewadi', district: 'PMC', city: 'Pune' },
    { name: 'Dhankawadi', district: 'PMC', city: 'Pune' },
    { name: 'Balaji Nagar', district: 'PMC / Dhankawadi', city: 'Pune', latitude: 18.4552, longitude: 73.8562 },
    { name: 'Kondhwa', district: 'PMC', city: 'Pune' },
    { name: 'Wanowrie', district: 'PMC', city: 'Pune' },
    { name: 'NIBM Road', district: 'PMC', city: 'Pune' },
    { name: 'Camp', district: 'Cantonment', city: 'Pune' },
    { name: 'Shivaji Nagar', district: 'PMC', city: 'Pune' },
    { name: 'Swargate', district: 'PMC', city: 'Pune' },
    { name: 'Deccan Gymkhana', district: 'PMC', city: 'Pune' },
    { name: 'Warje', district: 'PMC', city: 'Pune' },
    { name: 'Sinhagad Road', district: 'PMC', city: 'Pune' },
    { name: 'Karve Nagar', district: 'PMC', city: 'Pune' },
    { name: 'Dapodi', district: 'PCMC', city: 'Pune' },
    { name: 'Pimple Saudagar', district: 'PCMC', city: 'Pune' },
    { name: 'Pimple Gurav', district: 'PCMC', city: 'Pune' },
    { name: 'Pimple Nilakh', district: 'PCMC', city: 'Pune' },
    { name: 'Khadki', district: 'Cantonment', city: 'Pune' },
    { name: 'Yerawada', district: 'PMC', city: 'Pune' }
  ],
  mumbai: [
    { name: 'Bandra West', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Bandra East', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Andheri West', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Andheri East', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Juhu', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Powai', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Borivali West', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Borivali East', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Kandivali West', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Malad West', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Goregaon West', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Ghatkopar East', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Kurla', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Chembur', district: 'Mumbai Suburban', city: 'Mumbai' },
    { name: 'Dadar', district: 'Mumbai City', city: 'Mumbai' },
    { name: 'Colaba', district: 'Mumbai City', city: 'Mumbai' },
    { name: 'Lower Parel', district: 'Mumbai City', city: 'Mumbai' },
    { name: 'Worli', district: 'Mumbai City', city: 'Mumbai' },
    { name: 'Thane West', district: 'Thane', city: 'Mumbai' },
    { name: 'Vashi', district: 'Navi Mumbai', city: 'Mumbai' },
    { name: 'Nerul', district: 'Navi Mumbai', city: 'Mumbai' }
  ],
  bengaluru: [
    { name: 'Koramangala', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Indiranagar', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Whitefield', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Electronic City Phase 1', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Electronic City Phase 2', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'HSR Layout', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'BTM Layout', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Jayanagar', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'JP Nagar', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Marathahalli', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Bellandur', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Sarjapur Road', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Hebbal', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Yelahanka', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Malleswaram', district: 'Bengaluru Urban', city: 'Bengaluru' },
    { name: 'Rajajinagar', district: 'Bengaluru Urban', city: 'Bengaluru' }
  ],
  delhi: [
    { name: 'Connaught Place', district: 'Central Delhi', city: 'Delhi' },
    { name: 'Hauz Khas', district: 'South Delhi', city: 'Delhi' },
    { name: 'Saket', district: 'South Delhi', city: 'Delhi' },
    { name: 'Greater Kailash', district: 'South Delhi', city: 'Delhi' },
    { name: 'Lajpat Nagar', district: 'South Delhi', city: 'Delhi' },
    { name: 'Vasant Kunj', district: 'South West Delhi', city: 'Delhi' },
    { name: 'Dwarka', district: 'South West Delhi', city: 'Delhi' },
    { name: 'Rohini', district: 'North West Delhi', city: 'Delhi' },
    { name: 'Karol Bagh', district: 'Central Delhi', city: 'Delhi' },
    { name: 'Janakpuri', district: 'West Delhi', city: 'Delhi' }
  ],
  hyderabad: [
    { name: 'Hitec City', district: 'Cyberabad', city: 'Hyderabad' },
    { name: 'Madhapur', district: 'Cyberabad', city: 'Hyderabad' },
    { name: 'Gachibowli', district: 'Cyberabad', city: 'Hyderabad' },
    { name: 'Kondapur', district: 'Cyberabad', city: 'Hyderabad' },
    { name: 'Jubilee Hills', district: 'Hyderabad', city: 'Hyderabad' },
    { name: 'Banjara Hills', district: 'Hyderabad', city: 'Hyderabad' },
    { name: 'Kukatpally', district: 'Medchal-Malkajgiri', city: 'Hyderabad' },
    { name: 'Ameerpet', district: 'Hyderabad', city: 'Hyderabad' },
    { name: 'Secunderabad', district: 'Hyderabad', city: 'Hyderabad' }
  ],
  kolkata: [
    { name: 'Salt Lake Sector 1', district: 'Bidhannagar', city: 'Kolkata' },
    { name: 'Salt Lake Sector 5', district: 'Bidhannagar', city: 'Kolkata' },
    { name: 'New Town Action Area 1', district: 'North 24 Parganas', city: 'Kolkata' },
    { name: 'Park Street', district: 'Kolkata', city: 'Kolkata' },
    { name: 'Ballygunge', district: 'Kolkata', city: 'Kolkata' },
    { name: 'Alipore', district: 'Kolkata', city: 'Kolkata' },
    { name: 'Gariahat', district: 'Kolkata', city: 'Kolkata' },
    { name: 'Howrah', district: 'Howrah', city: 'Kolkata' },
    { name: 'Rajarhat', district: 'North 24 Parganas', city: 'Kolkata' },
    { name: 'Behala', district: 'South 24 Parganas', city: 'Kolkata' }
  ],
  chennai: [
    { name: 'T Nagar', district: 'Chennai', city: 'Chennai' },
    { name: 'Anna Nagar', district: 'Chennai', city: 'Chennai' },
    { name: 'Adyar', district: 'Chennai', city: 'Chennai' },
    { name: 'Velachery', district: 'Chennai', city: 'Chennai' },
    { name: 'Mylapore', district: 'Chennai', city: 'Chennai' },
    { name: 'OMR Road', district: 'Sholinganallur', city: 'Chennai' },
    { name: 'ECR Road', district: 'Chennai', city: 'Chennai' },
    { name: 'Nungambakkam', district: 'Chennai', city: 'Chennai' },
    { name: 'Porur', district: 'Chennai', city: 'Chennai' },
    { name: 'Tambaram', district: 'Chengalpattu', city: 'Chennai' }
  ],
  ahmedabad: [
    { name: 'SG Highway', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Satellite', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Vastrapur', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Bopal', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Prahlad Nagar', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Navrangpura', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Bodakdev', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Maninagar', district: 'Ahmedabad', city: 'Ahmedabad' },
    { name: 'Gandhinagar Sector 11', district: 'Gandhinagar', city: 'Ahmedabad' }
  ],
  chandigarh: [
    { name: 'Sector 17', district: 'Chandigarh', city: 'Chandigarh' },
    { name: 'Sector 35', district: 'Chandigarh', city: 'Chandigarh' },
    { name: 'Sector 22', district: 'Chandigarh', city: 'Chandigarh' },
    { name: 'Sector 8', district: 'Chandigarh', city: 'Chandigarh' },
    { name: 'Mohali Phase 3B2', district: 'SAS Nagar', city: 'Chandigarh' },
    { name: 'Mohali Phase 7', district: 'SAS Nagar', city: 'Chandigarh' },
    { name: 'Panchkula Sector 20', district: 'Panchkula', city: 'Chandigarh' },
    { name: 'Zirakpur VIP Road', district: 'SAS Nagar', city: 'Chandigarh' }
  ],
  jaipur: [
    { name: 'Malviya Nagar', district: 'Jaipur', city: 'Jaipur' },
    { name: 'Vaishali Nagar', district: 'Jaipur', city: 'Jaipur' },
    { name: 'Mansarovar', district: 'Jaipur', city: 'Jaipur' },
    { name: 'C-Scheme', district: 'Jaipur', city: 'Jaipur' },
    { name: 'Raja Park', district: 'Jaipur', city: 'Jaipur' },
    { name: 'Jagatpura', district: 'Jaipur', city: 'Jaipur' },
    { name: 'Bani Park', district: 'Jaipur', city: 'Jaipur' }
  ],
  lucknow: [
    { name: 'Gomti Nagar', district: 'Lucknow', city: 'Lucknow' },
    { name: 'Hazratganj', district: 'Lucknow', city: 'Lucknow' },
    { name: 'Indira Nagar', district: 'Lucknow', city: 'Lucknow' },
    { name: 'Alambagh', district: 'Lucknow', city: 'Lucknow' },
    { name: 'Mahanagar', district: 'Lucknow', city: 'Lucknow' },
    { name: 'Ashiyana', district: 'Lucknow', city: 'Lucknow' }
  ],
  kochi: [
    { name: 'Marine Drive', district: 'Ernakulam', city: 'Kochi' },
    { name: 'Panampilly Nagar', district: 'Ernakulam', city: 'Kochi' },
    { name: 'Kakkanad Infopark', district: 'Ernakulam', city: 'Kochi' },
    { name: 'Edappally', district: 'Ernakulam', city: 'Kochi' },
    { name: 'Palarivattom', district: 'Ernakulam', city: 'Kochi' },
    { name: 'Fort Kochi', district: 'Ernakulam', city: 'Kochi' },
    { name: 'Aluva', district: 'Ernakulam', city: 'Kochi' }
  ],
  indore: [
    { name: 'Vijay Nagar', district: 'Indore', city: 'Indore' },
    { name: 'Palasia', district: 'Indore', city: 'Indore' },
    { name: 'AB Road', district: 'Indore', city: 'Indore' },
    { name: 'Saket Nagar', district: 'Indore', city: 'Indore' },
    { name: 'Bhawarkua', district: 'Indore', city: 'Indore' }
  ],
  surat: [
    { name: 'Vesu', district: 'Surat', city: 'Surat' },
    { name: 'Piplod', district: 'Surat', city: 'Surat' },
    { name: 'Adajan', district: 'Surat', city: 'Surat' },
    { name: 'City Light', district: 'Surat', city: 'Surat' },
    { name: 'Varachha', district: 'Surat', city: 'Surat' }
  ],
  coimbatore: [
    { name: 'RS Puram', district: 'Coimbatore', city: 'Coimbatore' },
    { name: 'Race Course', district: 'Coimbatore', city: 'Coimbatore' },
    { name: 'Gandhipuram', district: 'Coimbatore', city: 'Coimbatore' },
    { name: 'Peelamedu', district: 'Coimbatore', city: 'Coimbatore' },
    { name: 'Saravanampatti', district: 'Coimbatore', city: 'Coimbatore' }
  ],
  visakhapatnam: [
    { name: 'MVP Colony', district: 'Visakhapatnam', city: 'Visakhapatnam' },
    { name: 'Siripuram', district: 'Visakhapatnam', city: 'Visakhapatnam' },
    { name: 'Dwaraka Nagar', district: 'Visakhapatnam', city: 'Visakhapatnam' },
    { name: 'Madhurawada', district: 'Visakhapatnam', city: 'Visakhapatnam' },
    { name: 'Gajuwaka', district: 'Visakhapatnam', city: 'Visakhapatnam' }
  ],
  patna: [
    { name: 'Boring Road', district: 'Patna', city: 'Patna' },
    { name: 'Bailey Road', district: 'Patna', city: 'Patna' },
    { name: 'Kankarbagh', district: 'Patna', city: 'Patna' },
    { name: 'Patliputra Colony', district: 'Patna', city: 'Patna' },
    { name: 'Rajendra Nagar', district: 'Patna', city: 'Patna' }
  ]
};

// Normalizes common city name variants across India
export const normalizeCity = (name) => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (lower === 'bangalore' || lower === 'bengaluru') return 'bengaluru';
  if (lower === 'mumbai' || lower === 'bombay') return 'mumbai';
  if (lower === 'calcutta' || lower === 'kolkata') return 'kolkata';
  if (lower === 'madras' || lower === 'chennai') return 'chennai';
  if (lower === 'gurgaon' || lower === 'gurugram') return 'delhi';
  if (lower === 'cochin' || lower === 'kochi') return 'kochi';
  if (lower === 'trivandrum' || lower === 'thiruvananthapuram') return 'thiruvananthapuram';
  if (lower === 'vizag' || lower === 'visakhapatnam') return 'visakhapatnam';
  if (lower === 'calicut' || lower === 'kozhikode') return 'kozhikode';
  if (lower === 'trichy' || lower === 'tiruchirappalli') return 'tiruchirappalli';
  if (lower === 'baroda' || lower === 'vadodara') return 'vadodara';
  if (lower === 'poona' || lower === 'pune') return 'pune';
  return lower;
};

// Checks if an OpenStreetMap feature belongs to the target city or its metropolitan cluster
// Dynamically extracts and isolates outside districts within the target state
export const matchesTargetCity = (props, cityName, stateName = '') => {
  if (!cityName) return true;
  const normCity = normalizeCity(cityName);
  const cluster = CITY_METRO_CLUSTERS[normCity] || [normCity];
  
  // Dynamic state-wide district isolation:
  // Gathers other distinct cities from the state master list that do not belong to this city's cluster
  const knownOtherDistricts = [...(KNOWN_OTHER_DISTRICTS[normCity] || [])];
  const stateEnum = (stateName && getStateFromStateName(stateName)) || getStateFromCityName(cityName);
  if (stateEnum) {
    const allStateCities = getCitiesForState(stateEnum);
    for (const sc of allStateCities) {
      const normSc = normalizeCity(sc.name || sc);
      if (normSc !== normCity && !cluster.includes(normSc) && !knownOtherDistricts.includes(normSc)) {
        knownOtherDistricts.push(normSc);
      }
    }
  }

  const locationValues = [
    props.city,
    props.town,
    props.district,
    props.state_district,
    props.county,
    props.locality,
    props.suburb
  ].filter(Boolean).map(v => v.toLowerCase().trim());

  // Check if location properties belong to another distinct district
  const isOtherDistrict = locationValues.some(val =>
    knownOtherDistricts.some(dist => val === dist || val.includes(dist))
  );
  if (isOtherDistrict) {
    return false;
  }

  // 1. Direct cluster match in administrative / locality tags
  const matchesCluster = locationValues.some(val => 
    cluster.some(alias => val === alias || val.includes(alias) || alias.includes(val))
  );
  if (matchesCluster) {
    return true;
  }

  // 2. Textual context match in name or street (e.g. "Courtyard by Marriott Pune Hinjewadi")
  const textContext = [props.name, props.street].filter(Boolean).join(' ').toLowerCase();
  const textMatches = cluster.some(alias => textContext.includes(alias));
  if (textMatches && !isOtherDistrict) {
    return true;
  }

  return false;
};

// Helper: checks if candidate area name matches user query with transliteration & compound word tolerance
export const matchesQueryFuzzy = (targetText, queryText) => {
  if (!targetText || !queryText) return false;
  const t = targetText.toLowerCase().trim();
  const q = queryText.toLowerCase().trim();

  if (t.includes(q) || q.includes(t)) return true;

  // Space-agnostic compound word matching (e.g., 'white field' <-> 'whitefield', 'salt lake' <-> 'saltlake')
  const tClean = t.replace(/[\s\-_.]/g, '');
  const qClean = q.replace(/[\s\-_.]/g, '');
  if (tClean.includes(qClean) || qClean.includes(tClean)) return true;

  // Regional Indian English transliteration variations across states
  if ((q.startsWith('hinjew') && t.includes('hinjaw')) || (q.startsWith('hinjaw') && t.includes('hinjew'))) {
    return true;
  }
  if ((q.startsWith('bhosri') && t.includes('bhosari')) || (q.startsWith('bhosari') && t.includes('bhosri'))) {
    return true;
  }
  if ((q.startsWith('kotrud') && t.includes('kothrud')) || (q.startsWith('kothrud') && t.includes('kotrud'))) {
    return true;
  }
  if ((q.startsWith('hadpsar') && t.includes('hadapsar')) || (q.startsWith('hadapsar') && t.includes('hadpsar'))) {
    return true;
  }
  if ((q.startsWith('marathalli') && t.includes('marathahalli')) || (q.startsWith('marathahalli') && t.includes('marathalli'))) {
    return true;
  }
  if ((q.startsWith('kukatpalli') && t.includes('kukatpally')) || (q.startsWith('kukatpally') && t.includes('kukatpalli'))) {
    return true;
  }
  if ((q.startsWith('vandre') && t.includes('bandra')) || (q.startsWith('bandra') && t.includes('vandre'))) {
    return true;
  }
  if ((q.startsWith('borivli') && t.includes('borivali')) || (q.startsWith('borivali') && t.includes('borivli'))) {
    return true;
  }
  if ((q.startsWith('kandivli') && t.includes('kandivali')) || (q.startsWith('kandivali') && t.includes('kandivli'))) {
    return true;
  }
  if (q.startsWith('hsr') && t.includes('hsr')) {
    return true;
  }
  if (q.startsWith('btm') && t.includes('btm')) {
    return true;
  }
  return false;
};

const searchService = {
  /**
   * Search for city names from backend
   * @param {string} keyword - The search keyword for city
   * @returns {Promise<string[]>} List of city names
   */
  searchCities: async (keyword = '') => {
    try {
      const response = await axiosInstance.get(`/salons/search/cities`, {
        params: { keyword }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching cities:', error);
      throw error;
    }
  },

  /**
   * Search for area names within a city from backend
   * @param {string} cityName - The name of the city
   * @param {string} keyword - The search keyword for area
   * @returns {Promise<string[]>} List of area names
   */
  searchAreas: async (cityName, keyword = '') => {
    try {
      const response = await axiosInstance.get(`/salons/search/areas`, {
        params: { cityName, keyword }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching areas:', error);
      throw error;
    }
  },

  /**
   * Get salons by city and area
   * @param {string} cityName - The name of the city
   * @param {string} [areaName] - The name of the area
   * @param {number} [latitude] - Customer latitude
   * @param {number} [longitude] - Customer longitude
   * @param {number} [radiusKm] - Radius in km (default 50)
   * @returns {Promise<Object[]>} List of salon objects
   */
  getSalonsByLocation: async (cityName = '', areaName = '', latitude = null, longitude = null, radiusKm = 50) => {
    try {
      const params = {};
      if (cityName) params.cityName = cityName;
      if (areaName) params.areaName = areaName;
      if (latitude) params.latitude = latitude;
      if (longitude) params.longitude = longitude;
      if (radiusKm) params.radiusKm = radiusKm;

      const response = await axiosInstance.get(`/salons/location-search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching salons by location:', error);
      throw error;
    }
  },

  /**
   * Fetch nearby salons within radius using coordinates and Haversine formula
   * @param {number} latitude - Customer latitude
   * @param {number} longitude - Customer longitude
   * @param {number} [radiusKm=50] - Radius in km
   * @param {string} [cityName] - Optional city name
   * @param {string} [areaName] - Optional area name
   * @param {string} [category] - Optional category
   * @param {number} [page=0] - Page number (zero-based)
   * @param {number} [size=10] - Page size
   * @returns {Promise<Object>} Paginated salons response
   */
  getNearbySalons: async (latitude, longitude, radiusKm = 50, cityName = '', areaName = '', category = '', page = 0, size = 10) => {
    try {
      const params = { latitude, longitude, radiusKm, page, size };
      if (cityName) params.cityName = cityName;
      if (areaName) params.areaName = areaName;
      if (category) params.category = category;
      const response = await axiosInstance.get(`/salons/nearby`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby salons:', error);
      throw error;
    }
  },

  /**
   * Search for locations using Komoot Photon Autocomplete geocoding API (OSM backed)
   * Enhanced with Indian metropolitan cluster awareness and transliteration tolerance
   * @param {string} query - The search query (e.g. Hinjewadi, Bandra, Pune)
   * @param {string} [featureClass] - 'city' or 'area' to filter results
   * @param {string} [cityName] - Optional city name to restrict area matches
   * @param {string} [stateName] - Optional state name/enum to restrict city/area matches
   * @returns {Promise<Array>} List of locality results
   */
  searchExternalLocations: async (query = '', featureClass = '', cityName = '', stateName = '', limit = 15) => {
    try {
      let searchQuery = query;
      const cleanState = stateName ? getStateDisplayName(stateName) : '';
      const results = [];
      const seen = new Set();
      const normQuery = query.toLowerCase().trim();
      const normSelectedCity = normalizeCity(cityName);

      // Pre-fill local known cities strictly for selected state
      if (featureClass === 'city' && stateName) {
        const localStateCities = getCitiesForState(stateName, query);
        for (const c of localStateCities) {
          if (!seen.has(c.name.toLowerCase())) {
            seen.add(c.name.toLowerCase());
            results.push(c);
          }
        }
      }

      // Pre-fill prime areas matching query for selected metro city
      if (featureClass === 'area' && cityName) {
        const primeList = METRO_PRIME_AREAS[normSelectedCity] || [];
        for (const prime of primeList) {
          if (matchesQueryFuzzy(prime.name, normQuery)) {
            const key = prime.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              results.push({ ...prime, type: 'area' });
            }
          }
        }
      }

      if (!query || query.trim().length < 2) {
        return results;
      }

      if (featureClass === 'city') {
        if (cleanState) {
          searchQuery = `${query} ${cleanState}`;
        }
      } else if (featureClass === 'area') {
        if (cityName && cleanState) {
          searchQuery = `${query} ${cityName} ${cleanState}`;
        } else if (cityName) {
          searchQuery = `${query} ${cityName}`;
        } else if (cleanState) {
          searchQuery = `${query} ${cleanState}`;
        }
      }
      
      const url = `https://photon.komoot.io/api`;
      const response = await axios.get(url, {
        params: {
          q: searchQuery,
          countrycode: 'in', // Target India strictly
          limit: limit
        }
      });
      
      const features = response.data?.features || [];
      
      for (const feature of features) {
        const props = feature.properties || {};
        
        // Extract clean primary area name without street prefix hierarchies
        const rawName = props.name || '';
        const cleanName = rawName.split(',')[0].trim();
        
        if (featureClass === 'city') {
          // Priority clean city matching
          const matchedCity = props.city || (props.osm_value === 'city' || props.osm_value === 'town' ? props.name : '');
          if (matchedCity && !seen.has(matchedCity.toLowerCase())) {
            const normCity = matchedCity.toLowerCase();
            
            // Strictly check if city belongs to selected state
            if (cleanState) {
              const featureStateEnum = props.state ? getStateFromStateName(props.state) : getStateFromCityName(matchedCity);
              const targetStateEnum = getStateFromStateName(cleanState);
              if (featureStateEnum && targetStateEnum && featureStateEnum !== targetStateEnum) {
                continue;
              }
            }

            // Ensure the city name itself matches the query string (prefix or substring)
            if (normCity.includes(normQuery)) {
              seen.add(matchedCity.toLowerCase());
              results.push({ name: matchedCity, type: 'city' });
            }
          }
        } else if (featureClass === 'area') {
          // Verify if result belongs to the selected city boundaries or metropolitan cluster
          const matchesCity = matchesTargetCity(props, cityName, cleanState);
          
          if (matchesCity) {
            // Gather candidate area/village names from the feature properties
            const candidates = [];
            if (props.village) candidates.push(props.village);
            if (props.hamlet) candidates.push(props.hamlet);
            if (props.locality) candidates.push(props.locality);
            if (props.suburb) candidates.push(props.suburb);
            if (props.district) candidates.push(props.district);
            if (props.neighbourhood) candidates.push(props.neighbourhood);

            // Clean street name as area candidate (strip road/lane/highway suffixes)
            if (props.street) {
              const cleanStreet = props.street
                .replace(/\b(road|rd|street|lane|path|marg|highway|hwy|bypass|circle)\b/gi, '')
                .trim();
              if (cleanStreet && cleanStreet.length > 2) {
                candidates.push(cleanStreet);
              }
            }

            // Extract village/locality from multi-part names (e.g. "SubCentre, Sukewadi" or "ZP School, Raytewadi")
            if (rawName) {
              const parts = rawName.split(/[,-]/).map(s => s.trim());
              for (const part of parts) {
                if (part && part.length > 2 && part.toLowerCase() !== cityName.toLowerCase()) {
                  const lowerPart = part.toLowerCase();
                  const isPoiPart = [
                    'airport', 'station', 'bus', 'stand', 'stop', 'hospital', 'university', 'college',
                    'school', 'junction', 'metro', 'railway', 'temple', 'church', 'mosque', 'mall', 'plaza',
                    'subcentre', 'sub centre', 'phc', 'grampanchayat', 'gram panchayat', 'karyalay', 'centre', 'center'
                  ].some(k => lowerPart.includes(k));
                  if (!isPoiPart) {
                    candidates.push(part);
                  }
                }
              }

              // Extract area token from POI/building name if it mentions user's search token
              const tokenPrefix = normQuery.slice(0, Math.min(normQuery.length, 4));
              const tokenRegex = new RegExp(`\\b(${tokenPrefix}[a-z0-9]*)\\b`, 'i');
              const tokenMatch = rawName.match(tokenRegex) || (props.street || '').match(tokenRegex);
              if (tokenMatch && tokenMatch[1] && tokenMatch[1].length > 2) {
                const extracted = tokenMatch[1].charAt(0).toUpperCase() + tokenMatch[1].slice(1);
                candidates.push(extracted);
              }
            }
            
            // Add cleanName if not a pure POI keyword and not city name
            if (cleanName && cleanName.toLowerCase() !== cityName.toLowerCase()) {
              const lowerClean = cleanName.toLowerCase();
              const isPoi = [
                'airport', 'station', 'bus', 'stand', 'stop', 'hospital', 'university', 'college',
                'school', 'junction', 'metro', 'railway', 'temple', 'church', 'mosque', 'mall', 'plaza',
                'subcentre', 'sub centre', 'phc', 'grampanchayat'
              ].some(k => lowerClean.includes(k));
              if (!isPoi) {
                candidates.push(cleanName);
              }
            }

            for (let cand of candidates) {
              cand = cand.trim();
              if (!cand || cand.length < 3) continue;

              // Skip if suggestion matches the city name itself
              const lowerCand = cand.toLowerCase();
              if (lowerCand === cityName.toLowerCase() || normalizeCity(cand) === normSelectedCity) continue;

              // Filter out common metadata / POI words from candidates
              const isExcluded = [
                'district', 'subdistrict', 'state', 'country', 'postcode', 'pin code', 'subdivision', 'division',
                'station', 'junction', 'airport', 'railway', 'bus stop', 'bus stand', 'metro line', 'metro station',
                'university', 'college', 'school', 'hospital', 'clinic', 'library', 'garden', 'park', 'zoo',
                'museum', 'police station', 'temple', 'church', 'mosque', 'terminal', 'depot', 'deppo'
              ].some(k => lowerCand.includes(k));
              if (isExcluded) continue;

              const addressComponents = [props.locality, props.suburb, props.district, props.city].filter(
                val => val && val.trim().length > 0 && val.toLowerCase() !== cand.toLowerCase()
              );
              const uniqueComponents = Array.from(new Set(addressComponents));
              if (cityName && !uniqueComponents.some(c => c.toLowerCase() === cityName.toLowerCase())) {
                uniqueComponents.push(cityName);
              }
              const displayCity = uniqueComponents.join(', ');

              const uniqueKey = cand.toLowerCase();
              if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                results.push({ 
                  name: cand, 
                  district: props.district || props.suburb || props.locality || props.county || '',
                  city: displayCity, 
                  type: 'area',
                  latitude: feature.geometry?.coordinates?.[1] || null,
                  longitude: feature.geometry?.coordinates?.[0] || null
                });
              }
            }
          }
        } else {
          // Unstructured fallback search
          if (cleanName) {
            const city = props.city || props.town || props.district || props.county || '';
            const label = city ? `${cleanName}, ${city}` : cleanName;
            if (!seen.has(label.toLowerCase())) {
              seen.add(label.toLowerCase());
              results.push({ label, city, area: cleanName });
            }
          }
        }
      }
      
      // Sort results to prioritize exact & fuzzy prefix matches of the user's typed area query
      results.sort((a, b) => {
        const nameA = (a.name || a.label || '').toLowerCase();
        const nameB = (b.name || b.label || '').toLowerCase();
        
        const startsA = nameA.startsWith(normQuery);
        const startsB = nameB.startsWith(normQuery);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        const fuzzyA = matchesQueryFuzzy(nameA, normQuery);
        const fuzzyB = matchesQueryFuzzy(nameB, normQuery);
        if (fuzzyA && !fuzzyB) return -1;
        if (!fuzzyA && fuzzyB) return 1;

        return nameA.localeCompare(nameB);
      });
      
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching external locations via Photon:', error);
      return [];
    }
  },

  /**
   * Safely detect coordinates using browser Geolocation with IP fallback and hard watchdog timeout
   * Prevents Chromium/Windows infinite hanging when GPS hardware is absent or permissions stall
   * @param {number} [timeoutMs=6000]
   * @returns {Promise<{latitude: number, longitude: number, isIpFallback: boolean}>}
   */
  detectCoordinates: async (timeoutMs = 6000) => {
    return new Promise((resolve, reject) => {
      let settled = false;

      const fallbackToIp = async () => {
        try {
          const res = await axios.get('https://ipwho.is/', { timeout: 3000 });
          if (res.data?.success && res.data?.latitude && res.data?.longitude) {
            return {
              latitude: Number(res.data.latitude),
              longitude: Number(res.data.longitude),
              city: res.data.city || '',
              region: res.data.region || '',
              isIpFallback: true
            };
          }
        } catch {
          // try next
        }

        try {
          const res = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', { timeout: 3000 });
          if (res.data?.latitude && res.data?.longitude) {
            return {
              latitude: Number(res.data.latitude),
              longitude: Number(res.data.longitude),
              city: res.data.city || '',
              region: res.data.principalSubdivision || '',
              isIpFallback: true
            };
          }
        } catch {
          // IP fallback failed
        }
        return null;
      };

      // Safety watchdog timer - triggers if browser geolocation hangs
      const timer = setTimeout(async () => {
        if (settled) return;
        settled = true;
        const ipCoords = await fallbackToIp();
        if (ipCoords) {
          resolve(ipCoords);
        } else {
          reject(new Error("Location request timed out. Please enter manually."));
        }
      }, timeoutMs);

      if (typeof window === 'undefined' || !navigator.geolocation) {
        clearTimeout(timer);
        settled = true;
        fallbackToIp().then(ipCoords => {
          if (ipCoords) resolve(ipCoords);
          else reject(new Error("Geolocation is not supported by your browser."));
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            isIpFallback: false
          });
        },
        async () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          const ipCoords = await fallbackToIp();
          if (ipCoords) {
            resolve(ipCoords);
          } else {
            reject(new Error("Location access denied or unavailable."));
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    });
  },

  /**
   * Calculate distance between two lat/lng points using Haversine formula
   * @param {number} lat1 
   * @param {number} lon1 
   * @param {number} lat2 
   * @param {number} lon2 
   * @returns {number|null} Distance in kilometers
   */
  calculateDistanceKm: (lat1, lon1, lat2, lon2) => {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
    const numLat1 = Number(lat1);
    const numLon1 = Number(lon1);
    const numLat2 = Number(lat2);
    const numLon2 = Number(lon2);
    if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;
    if (numLat1 === 0 && numLon1 === 0) return null;
    if (numLat2 === 0 && numLon2 === 0) return null;

    const R = 6371; // Earth radius in km
    const dLat = (numLat2 - numLat1) * Math.PI / 180;
    const dLon = (numLon2 - numLon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(numLat1 * Math.PI / 180) * Math.cos(numLat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Format kilometer distance into readable string (e.g. 450m or 2.1 km)
   */
  formatDistance: (km) => {
    if (km === null || km === undefined) return '';
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)} km`;
  },

  /**
   * Reverse geocode using Google Maps Geocoding API if key is available
   */
  reverseGeocodeGoogle: async (lat, lng, apiKey) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json`;
      const response = await axios.get(url, {
        params: {
          latlng: `${lat},${lng}`,
          key: apiKey,
          language: 'en'
        }
      });

      const results = response.data?.results || [];
      if (results.length === 0) return null;

      let area = '';
      let city = '';
      let state = '';
      let pincode = '';
      let landmark = '';

      for (const res of results) {
        for (const comp of res.address_components || []) {
          const types = comp.types || [];
          if (!area && (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood'))) {
            area = comp.long_name;
          }
          if (!city && (types.includes('locality') || types.includes('administrative_area_level_2'))) {
            city = comp.long_name;
          }
          if (!state && types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          }
          if (!pincode && types.includes('postal_code')) {
            pincode = comp.long_name;
          }
          if (!landmark && (types.includes('point_of_interest') || types.includes('establishment') || types.includes('premise'))) {
            landmark = comp.long_name;
          }
        }
      }

      const formattedAddress = results[0]?.formatted_address || '';
      const stateEnum = getStateFromStateName(state) || getStateFromCityName(city) || null;

      return {
        city: city.trim(),
        area: area.trim(),
        landmark: landmark.trim(),
        nearbyLandmarks: [],
        stateName: state.trim(),
        stateEnum: stateEnum,
        pincode: pincode.trim(),
        formattedAddress: formattedAddress,
        latitude: lat,
        longitude: lng,
        source: 'google'
      };
    } catch (err) {
      console.warn('Google reverse geocode error:', err);
      return null;
    }
  },

  /**
   * Reverse geocode using Ola Maps API if key is available
   */
  reverseGeocodeOla: async (lat, lng, apiKey) => {
    try {
      const url = `https://api.olamaps.io/places/v1/reverse-geocode`;
      const response = await axios.get(url, {
        params: {
          latlng: `${lat},${lng}`,
          api_key: apiKey
        }
      });

      const results = response.data?.results || [];
      if (results.length === 0) return null;

      let area = '';
      let city = '';
      let state = '';
      let pincode = '';
      let landmark = '';

      const landmarkItems = [];
      const seenTitles = new Set();

      const addLandmark = (title, subtitle = '', distance = '', type = '') => {
        if (!title || typeof title !== 'string') return;
        const clean = title.trim();
        const lower = clean.toLowerCase();
        if (clean.length < 2 || ['pune', 'mumbai', 'india', 'maharashtra', 'delhi', 'bangalore', 'bengaluru'].includes(lower)) return;
        if (seenTitles.has(lower)) return;
        seenTitles.add(lower);
        landmarkItems.push({
          title: clean,
          subtitle: subtitle ? subtitle.trim() : '',
          distance: distance ? `${distance}m away` : '',
          type: type || 'landmark'
        });
      };

      for (const res of results) {
        // Extract landmark phrases like "Near ...", "Opp ...", "Behind ..." from formatted_address
        if (res.formatted_address) {
          const match = res.formatted_address.match(/\b((?:Near|Opp|Opposite|Behind|Beside|Next to)\s+[^,]+)/i);
          if (match && match[1]) {
            addLandmark(match[1].trim(), res.name || res.formatted_address, res.distance_meters, 'landmark');
          }
        }

        // Collect venue / building names
        if (res.name && typeof res.name === 'string') {
          const primaryType = Array.isArray(res.types) && res.types[0] ? res.types[0] : 'venue';
          addLandmark(res.name, res.formatted_address, res.distance_meters, primaryType);
        }

        let compLocality = '';
        let compAdmin3 = ''; // Taluka / Sub-district (e.g. Kopargaon, Haveli)
        let compAdmin2 = ''; // District (e.g. Ahmednagar, Pune)
        let compSublocality = '';
        let compNeighborhood = '';

        for (const comp of res.address_components || []) {
          const types = comp.types || [];
          if (types.includes('locality')) compLocality = comp.long_name;
          if (types.includes('administrative_area_level_3')) compAdmin3 = comp.long_name;
          if (types.includes('administrative_area_level_2')) compAdmin2 = comp.long_name;
          if (types.includes('sublocality_level_1') || types.includes('sublocality')) compSublocality = comp.long_name;
          if (types.includes('neighborhood') || types.includes('sublocality_level_2')) compNeighborhood = comp.long_name;

          if (!state && types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          }
          if (!pincode && types.includes('postal_code')) {
            pincode = comp.long_name;
          }
          if (!landmark && (types.includes('point_of_interest') || types.includes('establishment') || types.includes('premise'))) {
            landmark = comp.long_name;
          }
        }

        if (!city) {
          // Priority: Locality (actual city/town) > Admin Level 3 (taluka) > Admin Level 2 (district)
          city = compLocality || compAdmin3 || compAdmin2 || '';
        }
        if (!area) {
          area = compSublocality || compNeighborhood || (compLocality && compLocality !== city ? compLocality : '');
        }
      }

      if (!landmark && landmarkItems.length > 0) {
        // Prefer "Near ..." or "Opp ..." landmark if found
        const preferred = landmarkItems.find(l => /^near\s+/i.test(l.title)) || landmarkItems[0];
        landmark = preferred.title;
      }

      const formattedAddress = results[0]?.formatted_address || '';
      const stateEnum = getStateFromStateName(state) || getStateFromCityName(city) || null;

      return {
        city: city.trim(),
        area: area.trim(),
        landmark: landmark.trim(),
        nearbyLandmarks: landmarkItems,
        stateName: state.trim(),
        stateEnum: stateEnum,
        pincode: pincode.trim(),
        formattedAddress: formattedAddress,
        latitude: lat,
        longitude: lng,
        source: 'olamaps'
      };
    } catch (err) {
      console.warn('Ola Maps reverse geocode error:', err);
      return null;
    }
  },

  /**
   * Reverse geocode lat/lng to get city and area details via Google Geocoding, Ola Maps, or Photon API
   * Automatically resolves metro peripheral subdistricts to their parent city across India
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {Object} [options] - Options like preferGoogle
   * @returns {Promise<{city: string, area: string, stateName: string, stateEnum: string}>}
   */
  /**
   * Reverse geocode using Photon Komoot API (free OSM-based geocoder, no API key required)
   * Recommended for background GPS, search bar auto-fill, and navbar location indicator
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>}
   */
  reverseGeocodePhoton: async (lat, lng) => {
    try {
      const url = `https://photon.komoot.io/reverse`;
      const response = await axios.get(url, {
        params: {
          lat: lat,
          lon: lng,
          limit: 15
        }
      });
      
      const features = response.data?.features || [];
      if (features.length === 0) {
        return { city: '', area: '', landmark: '', nearbyLandmarks: [], stateName: '', stateEnum: null, latitude: lat, longitude: lng, source: 'photon' };
      }
      
      const props = features[0].properties || {};
      
      // Helper to extract a clean city name from county or city properties
      const extractCleanCity = (p) => {
        const candidates = [p.city, p.town, p.municipality, p.village, p.county, p.district, p.state_district];
        const stopwords = [
          /\bsubdistrict\b/gi,
          /\bdistrict\b/gi,
          /\bcity\b/gi,
          /\burban\b/gi,
          /\bsuburban\b/gi,
          /\btown\b/gi,
          /\bdivision\b/gi,
          /\bcorporation\b/gi,
          /\bmunicipal\b/gi
        ];
        
        for (const candidate of candidates) {
          if (!candidate) continue;
          
          let name = candidate.split(',').pop().trim();
          for (const regex of stopwords) {
            name = name.replace(regex, '');
          }
          name = name.replace(/\s+/g, ' ').trim();
          
          if (name && name.length > 2) {
            const lower = name.toLowerCase();
            // Map subdistricts of major metro cities across India
            const SUBDISTRICT_TO_CITY = {
              mulshi: 'Pune',
              haveli: 'Pune',
              mhalunge: 'Pune',
              maan: 'Pune',
              'pimpri-chinchwad': 'Pune',
              'pimpri chinchwad': 'Pune',
              pcmc: 'Pune',
              kalyan: 'Mumbai',
              dombivli: 'Mumbai',
              thane: 'Thane',
              'navi mumbai': 'Navi Mumbai',
              'mira-bhayandar': 'Mumbai',
              'vasai-virar': 'Mumbai',
              panvel: 'Navi Mumbai',
              'bengaluru urban': 'Bengaluru',
              'bengaluru rural': 'Bengaluru',
              anekal: 'Bengaluru',
              devanahalli: 'Bengaluru',
              hoskote: 'Bengaluru',
              cyberabad: 'Hyderabad',
              medchal: 'Hyderabad',
              malkajgiri: 'Hyderabad',
              rangareddy: 'Hyderabad',
              shamshabad: 'Hyderabad',
              tambaram: 'Chennai',
              avadi: 'Chennai',
              sholinganallur: 'Chennai',
              chengalpattu: 'Chennai',
              thiruvallur: 'Chennai',
              bidhannagar: 'Kolkata',
              'salt lake': 'Kolkata',
              rajarhat: 'Kolkata',
              'new town': 'Kolkata',
              howrah: 'Kolkata',
              'north 24 parganas': 'Kolkata',
              gandhinagar: 'Ahmedabad',
              sanand: 'Ahmedabad',
              daskroi: 'Ahmedabad',
              mohali: 'Chandigarh',
              'sas nagar': 'Chandigarh',
              panchkula: 'Chandigarh',
              zirakpur: 'Chandigarh',
              kharar: 'Chandigarh',
              kakkanad: 'Kochi',
              aluva: 'Kochi',
              tripunithura: 'Kochi',
              kalamassery: 'Kochi',
              sanganer: 'Jaipur',
              amer: 'Jaipur',
              rau: 'Indore',
              mhow: 'Indore',
              danapur: 'Patna',
              'phulwari sharif': 'Patna'
            };
            if (SUBDISTRICT_TO_CITY[lower]) return SUBDISTRICT_TO_CITY[lower];

            if (lower === 'bengaluru' || lower === 'bangalore') return 'Bengaluru';
            if (lower === 'mumbai' || lower === 'bombay') return 'Mumbai';
            if (lower === 'calcutta' || lower === 'kolkata') return 'Kolkata';
            if (lower === 'madras' || lower === 'chennai') return 'Chennai';
            if (lower === 'gurgaon' || lower === 'gurugram') return 'Delhi';
            if (lower === 'cochin' || lower === 'kochi') return 'Kochi';
            if (lower === 'vizag' || lower === 'visakhapatnam') return 'Visakhapatnam';
            return name;
          }
        }
        return '';
      };
      
      let city = extractCleanCity(props) || props.city || '';
      if (!city) {
        for (const feat of features) {
          const c = extractCleanCity(feat.properties || {}) || feat.properties?.city;
          if (c) {
            city = c;
            break;
          }
        }
      }
      
      // Extract broader area name (prioritizing suburb, locality, neighbourhood, village, hamlet)
      let area = props.suburb || props.locality || props.neighbourhood || props.village || props.hamlet || props.district || '';
      if (!area || (city && area.toLowerCase() === city.toLowerCase())) {
        for (const feat of features) {
          const p = feat.properties || {};
          const candidateArea = p.suburb || p.locality || p.neighbourhood || p.village || p.hamlet || p.district;
          if (candidateArea && (!city || candidateArea.toLowerCase() !== city.toLowerCase())) {
            area = candidateArea;
            break;
          }
        }
      }
      if (!area || (city && area.toLowerCase() === city.toLowerCase())) {
        area = props.name && (!city || props.name.toLowerCase() !== city.toLowerCase()) ? props.name : (props.street || '');
      }

      // Extract state
      let rawState = props.state || '';
      if (!rawState) {
        for (const feat of features) {
          if (feat.properties?.state) {
            rawState = feat.properties.state;
            break;
          }
        }
      }
      const stateEnum = getStateFromStateName(rawState) || getStateFromCityName(city.trim()) || null;

      // Extract POI landmarks from nearby features
      const detectedLandmarks = [];
      const seenNames = new Set();
      const areaLower = area.toLowerCase().trim();
      const cityLower = city.toLowerCase().trim();

      for (const feat of features) {
        const p = feat.properties || {};
        const name = p.name ? p.name.trim() : '';
        if (!name || name.length < 2) continue;

        const nameLower = name.toLowerCase();
        if (nameLower === areaLower || nameLower === cityLower) continue;

        const isRoad = p.osm_key === 'highway' && ['primary', 'secondary', 'tertiary', 'residential', 'trunk', 'service', 'motorway', 'unclassified'].includes(p.osm_value);
        const isAreaBoundary = ['suburb', 'locality', 'neighbourhood', 'district', 'village', 'hamlet', 'city', 'town', 'county', 'state', 'country'].includes(p.osm_value) || p.type === 'district' || p.type === 'city';
        const isChowkOrSignal = nameLower.includes('chowk') || nameLower.includes('circle') || nameLower.includes('junction') || nameLower.includes('signal') || p.osm_value === 'traffic_signals';

        if ((!isRoad && !isAreaBoundary) || isChowkOrSignal) {
          if (!seenNames.has(nameLower)) {
            seenNames.add(nameLower);
            const typeLabel = p.osm_value ? p.osm_value.replace(/_/g, ' ') : (p.osm_key || 'Landmark');
            const sub = p.street || (typeLabel !== 'Landmark' ? typeLabel : '');
            detectedLandmarks.push({
              title: name,
              name: name,
              subtitle: sub,
              type: typeLabel,
              street: p.street || ''
            });
          }
        }
      }

      const primaryLandmark = detectedLandmarks.length > 0 ? detectedLandmarks[0].name : '';

      return {
        city: city.trim(),
        area: area.trim(),
        landmark: primaryLandmark,
        nearbyLandmarks: detectedLandmarks,
        stateName: rawState,
        stateEnum: stateEnum,
        pincode: props.postcode || '',
        formattedAddress: [area, city, rawState].filter(Boolean).join(', '),
        latitude: lat,
        longitude: lng,
        source: 'photon'
      };
    } catch (error) {
      console.error('Error reverse geocoding via Photon:', error);
      throw error;
    }
  },

  /**
   * Reverse geocode coordinates to find locality, city, state and landmarks
   * Supports provider selection: 'photon' (free, zero quota), 'olamaps', 'google', or 'auto'
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {Object} [options] - Options e.g. { provider: 'photon' | 'olamaps' | 'google', preferGoogle: boolean }
   * @returns {Promise<{city: string, area: string, stateName: string, stateEnum: string}>}
   */
  reverseGeocode: async (lat, lng, options = {}) => {
    try {
      // 1. If caller explicitly requested photon (e.g. HomeScreen search bar / navbar location indicator)
      if (options.provider === 'photon' || options.usePhoton) {
        return await searchService.reverseGeocodePhoton(lat, lng);
      }

      // 2. Try Google if key configured and preferred
      const googleApiKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_MAPS_API_KEY : null;
      if (googleApiKey && (options.provider === 'google' || options.preferGoogle || options.useGoogle)) {
        const gRes = await searchService.reverseGeocodeGoogle(lat, lng, googleApiKey);
        if (gRes && (gRes.city || gRes.area)) {
          return gRes;
        }
      }

      // 3. Try Ola Maps if key configured or provider is explicitly 'olamaps'
      const olaApiKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OLA_MAPS_API_KEY : null;
      if (olaApiKey && (options.provider === 'olamaps' || !options.provider)) {
        const olaRes = await searchService.reverseGeocodeOla(lat, lng, olaApiKey);
        if (olaRes && (olaRes.city || olaRes.area)) {
          return olaRes;
        }
      }

      // 4. Fallback to free Photon Komoot
      return await searchService.reverseGeocodePhoton(lat, lng);
    } catch (err) {
      console.error('Error in reverseGeocode:', err);
      try {
        return await searchService.reverseGeocodePhoton(lat, lng);
      } catch {
        return { city: '', area: '', landmark: '', nearbyLandmarks: [], stateName: '', stateEnum: null, latitude: lat, longitude: lng };
      }
    }
  },

  /**
   * Search for real-world POI landmarks (Hospitals, Colleges, Malls, Stations, Buildings, etc.)
   * Uses multi-pass district-aware fallback search with strict administrative boundary validation
   * @param {string} query - Search term for landmark (e.g. Siddhi, Hospital)
   * @param {string} [areaName] - Area name filter
   * @param {string} [cityName] - City name filter
   * @param {string} [stateName] - State name filter
   * @param {string} [districtName] - District name associated with area
   * @param {number} [limit=15]
   * @returns {Promise<Array>} List of landmark objects { name, type, details, rankScore }
   */
  searchLandmarks: async (query = '', areaName = '', cityName = '', stateName = '', districtName = '', limit = 15) => {
    try {
      const cleanState = stateName ? getStateDisplayName(stateName) : '';
      if (!query || query.trim().length < 2) return [];

      const url = `https://photon.komoot.io/api`;

      const fetchFeatures = async (qString) => {
        if (!qString || qString.trim().length < 2) return [];
        try {
          const response = await axios.get(url, {
            params: {
              q: qString,
              countrycode: 'in',
              limit: limit
            }
          });
          return response.data?.features || [];
        } catch {
          return [];
        }
      };

      // Construct search queries to run in parallel
      const queriesToTry = [];

      // Query 1: Full specific zone with district (Landmark + District + City + State)
      if (districtName) {
        queriesToTry.push([query, districtName, cityName, cleanState].filter(Boolean).join(' '));
      }

      // Query 2: Area specific zone (Landmark + Area + City + State)
      if (areaName) {
        queriesToTry.push([query, areaName, cityName, cleanState].filter(Boolean).join(' '));
      }

      // Query 3: City-wide search (Landmark + City + State)
      if (cityName) {
        queriesToTry.push([query, cityName, cleanState].filter(Boolean).join(' '));
      } else {
        queriesToTry.push([query, cleanState].filter(Boolean).join(' '));
      }

      // Execute queries concurrently
      const responses = await Promise.all(queriesToTry.map(q => fetchFeatures(q)));
      const rawFeatures = responses.flat();

      const results = [];
      const seen = new Set();
      const normArea = areaName.toLowerCase().trim();
      const normDistrict = districtName.toLowerCase().trim();

      for (const feature of rawFeatures) {
        const props = feature.properties || {};
        
        // 1. Strict State verification
        if (cleanState && props.state) {
          const featureStateEnum = getStateFromStateName(props.state);
          const targetStateEnum = getStateFromStateName(cleanState);
          if (featureStateEnum && targetStateEnum && featureStateEnum !== targetStateEnum) {
            continue;
          }
        }

        // 2. Strict City/District boundary validation: MUST belong to target city/metro cluster
        // Prevents inter-city highways (e.g. Pune-Nashik highway, Bangalore-Mysore highway) from leaking other districts
        if (!matchesTargetCity(props, cityName, cleanState)) {
          continue;
        }

        const name = props.name || props.street || '';
        if (!name || name.trim().length < 3) continue;

        const lowerName = name.trim().toLowerCase();
        if (seen.has(lowerName)) continue;

        // Skip plain city/state/area names
        if (cityName && lowerName === cityName.toLowerCase()) continue;
        if (areaName && lowerName === normArea) continue;
        if (districtName && lowerName === normDistrict) continue;

        seen.add(lowerName);

        const details = [props.street, props.district || props.locality || props.suburb, props.city].filter(Boolean).join(', ');
        const lowerDetails = details.toLowerCase();

        // Calculate relevance rank (high boost for matching user selected area or district)
        let rankScore = 10;
        if (normArea && (lowerName.includes(normArea) || lowerDetails.includes(normArea))) {
          rankScore += 100;
        }
        if (normDistrict && (lowerName.includes(normDistrict) || lowerDetails.includes(normDistrict))) {
          rankScore += 50;
        }
        if (lowerName.startsWith(query.toLowerCase().trim())) {
          rankScore += 30;
        }

        results.push({
          title: name.trim(),
          name: name.trim(),
          subtitle: details,
          type: props.osm_value || props.type || 'landmark',
          details: details,
          rankScore: rankScore
        });
      }

      // Sort results by rankScore descending
      results.sort((a, b) => b.rankScore - a.rankScore);

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching landmarks via Photon:', error);
      return [];
    }
  }
};

export default searchService;
export const calculateDistanceKm = searchService.calculateDistanceKm;
export const formatDistance = searchService.formatDistance;
export const reverseGeocodeGoogle = searchService.reverseGeocodeGoogle;
export const reverseGeocodeOla = searchService.reverseGeocodeOla;
export const reverseGeocodePhoton = searchService.reverseGeocodePhoton;
export const reverseGeocode = searchService.reverseGeocode;
