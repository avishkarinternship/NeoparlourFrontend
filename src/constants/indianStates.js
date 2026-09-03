export const INDIAN_STATES = [
  { enumValue: 'JAMMU_AND_KASHMIR', displayName: 'Jammu and Kashmir', stateCode: '01' },
  { enumValue: 'HIMACHAL_PRADESH', displayName: 'Himachal Pradesh', stateCode: '02' },
  { enumValue: 'PUNJAB', displayName: 'Punjab', stateCode: '03' },
  { enumValue: 'CHANDIGARH', displayName: 'Chandigarh', stateCode: '04' },
  { enumValue: 'UTTARAKHAND', displayName: 'Uttarakhand', stateCode: '05' },
  { enumValue: 'HARYANA', displayName: 'Haryana', stateCode: '06' },
  { enumValue: 'DELHI', displayName: 'Delhi', stateCode: '07' },
  { enumValue: 'RAJASTHAN', displayName: 'Rajasthan', stateCode: '08' },
  { enumValue: 'UTTAR_PRADESH', displayName: 'Uttar Pradesh', stateCode: '09' },
  { enumValue: 'BIHAR', displayName: 'Bihar', stateCode: '10' },
  { enumValue: 'SIKKIM', displayName: 'Sikkim', stateCode: '11' },
  { enumValue: 'ARUNACHAL_PRADESH', displayName: 'Arunachal Pradesh', stateCode: '12' },
  { enumValue: 'NAGALAND', displayName: 'Nagaland', stateCode: '13' },
  { enumValue: 'MANIPUR', displayName: 'Manipur', stateCode: '14' },
  { enumValue: 'MIZORAM', displayName: 'Mizoram', stateCode: '15' },
  { enumValue: 'TRIPURA', displayName: 'Tripura', stateCode: '16' },
  { enumValue: 'MEGHALAYA', displayName: 'Meghalaya', stateCode: '17' },
  { enumValue: 'ASSAM', displayName: 'Assam', stateCode: '18' },
  { enumValue: 'WEST_BENGAL', displayName: 'West Bengal', stateCode: '19' },
  { enumValue: 'JHARKHAND', displayName: 'Jharkhand', stateCode: '20' },
  { enumValue: 'ODISHA', displayName: 'Odisha', stateCode: '21' },
  { enumValue: 'CHHATTISGARH', displayName: 'Chhattisgarh', stateCode: '22' },
  { enumValue: 'MADHYA_PRADESH', displayName: 'Madhya Pradesh', stateCode: '23' },
  { enumValue: 'GUJARAT', displayName: 'Gujarat', stateCode: '24' },
  { enumValue: 'DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU', displayName: 'Dadra and Nagar Haveli and Daman and Diu', stateCode: '26' },
  { enumValue: 'MAHARASHTRA', displayName: 'Maharashtra', stateCode: '27' },
  { enumValue: 'KARNATAKA', displayName: 'Karnataka', stateCode: '29' },
  { enumValue: 'GOA', displayName: 'Goa', stateCode: '30' },
  { enumValue: 'LAKSHADWEEP', displayName: 'Lakshadweep', stateCode: '31' },
  { enumValue: 'KERALA', displayName: 'Kerala', stateCode: '32' },
  { enumValue: 'TAMIL_NADU', displayName: 'Tamil Nadu', stateCode: '33' },
  { enumValue: 'PUDUCHERRY', displayName: 'Puducherry', stateCode: '34' },
  { enumValue: 'ANDAMAN_AND_NICOBAR_ISLANDS', displayName: 'Andaman and Nicobar Islands', stateCode: '35' },
  { enumValue: 'TELANGANA', displayName: 'Telangana', stateCode: '36' },
  { enumValue: 'ANDHRA_PRADESH', displayName: 'Andhra Pradesh', stateCode: '37' },
  { enumValue: 'LADAKH', displayName: 'Ladakh', stateCode: '38' }
];

/**
 * Helper function: Derives state enum from first 2 digits of GSTIN
 */
export const getStateFromGstin = (gstin) => {
  if (!gstin || gstin.trim().length < 2) return null;
  const prefix = gstin.trim().substring(0, 2);
  const foundState = INDIAN_STATES.find(s => s.stateCode === prefix);
  return foundState ? foundState.enumValue : null;
};

/**
 * Helper function: Derives state enum from a state name string or alias
 */
export const getStateFromStateName = (stateName) => {
  if (!stateName || typeof stateName !== 'string') return null;
  const clean = stateName.trim().toLowerCase();
  
  const found = INDIAN_STATES.find(s => 
    s.displayName.toLowerCase() === clean || 
    s.enumValue.toLowerCase() === clean ||
    s.enumValue.replace(/_/g, ' ').toLowerCase() === clean
  );
  if (found) return found.enumValue;

  if (clean.includes('maharashtra') || clean === 'mh') return 'MAHARASHTRA';
  if (clean.includes('karnataka') || clean === 'ka') return 'KARNATAKA';
  if (clean.includes('delhi') || clean === 'dl') return 'DELHI';
  if (clean.includes('haryana') || clean === 'hr') return 'HARYANA';
  if (clean.includes('punjab') || clean === 'pb') return 'PUNJAB';
  if (clean.includes('uttar pradesh') || clean === 'up') return 'UTTAR_PRADESH';
  if (clean.includes('rajasthan') || clean === 'rj') return 'RAJASTHAN';
  if (clean.includes('gujarat') || clean === 'gj') return 'GUJARAT';
  if (clean.includes('telangana') || clean === 'ts' || clean === 'tg') return 'TELANGANA';
  if (clean.includes('andhra') || clean === 'ap') return 'ANDHRA_PRADESH';
  if (clean.includes('tamil') || clean === 'tn') return 'TAMIL_NADU';
  if (clean.includes('bengal') || clean === 'wb') return 'WEST_BENGAL';
  if (clean.includes('bihar') || clean === 'br') return 'BIHAR';
  if (clean.includes('madhya pradesh') || clean === 'mp') return 'MADHYA_PRADESH';
  if (clean.includes('chandigarh') || clean === 'ch') return 'CHANDIGARH';
  if (clean.includes('himachal') || clean === 'hp') return 'HIMACHAL_PRADESH';
  if (clean.includes('uttarakhand') || clean === 'uk' || clean === 'ua') return 'UTTARAKHAND';
  if (clean.includes('jharkhand') || clean === 'jh') return 'JHARKHAND';
  if (clean.includes('chhattisgarh') || clean === 'cg') return 'CHHATTISGARH';
  if (clean.includes('odisha') || clean.includes('orissa') || clean === 'od' || clean === 'or') return 'ODISHA';
  if (clean.includes('kerala') || clean === 'kl') return 'KERALA';
  if (clean.includes('goa') || clean === 'ga') return 'GOA';
  if (clean.includes('kashmir') || clean.includes('jammu') || clean === 'jk') return 'JAMMU_AND_KASHMIR';
  if (clean.includes('ladakh') || clean === 'la') return 'LADAKH';
  if (clean.includes('assam') || clean === 'as') return 'ASSAM';

  return null;
};

/**
 * Helper function: Derives state enum from a city name
 */
export const getStateFromCityName = (cityName) => {
  if (!cityName || typeof cityName !== 'string') return null;
  const lower = cityName.trim().toLowerCase();

  const CITY_STATE_MAP = {
    pune: 'MAHARASHTRA', mumbai: 'MAHARASHTRA', bombay: 'MAHARASHTRA', nagpur: 'MAHARASHTRA',
    nashik: 'MAHARASHTRA', nasik: 'MAHARASHTRA', thane: 'MAHARASHTRA', 'navi mumbai': 'MAHARASHTRA',
    solapur: 'MAHARASHTRA', kolhapur: 'MAHARASHTRA', aurangabad: 'MAHARASHTRA', 'chhatrapati sambhajinagar': 'MAHARASHTRA',
    amravati: 'MAHARASHTRA', nanded: 'MAHARASHTRA', sangli: 'MAHARASHTRA', jalgaon: 'MAHARASHTRA',
    akola: 'MAHARASHTRA', latur: 'MAHARASHTRA', dhule: 'MAHARASHTRA', ahmednagar: 'MAHARASHTRA',
    
    bengaluru: 'KARNATAKA', bangalore: 'KARNATAKA', mysuru: 'KARNATAKA', mysore: 'KARNATAKA',
    hubballi: 'KARNATAKA', hubli: 'KARNATAKA', mangaluru: 'KARNATAKA', mangalore: 'KARNATAKA',
    belagavi: 'KARNATAKA', belgaum: 'KARNATAKA', kalaburagi: 'KARNATAKA', davanagere: 'KARNATAKA',
    ballari: 'KARNATAKA', bellary: 'KARNATAKA', tumakuru: 'KARNATAKA', shivamogga: 'KARNATAKA',
    
    delhi: 'DELHI', 'new delhi': 'DELHI',
    
    gurgaon: 'HARYANA', gurugram: 'HARYANA', faridabad: 'HARYANA', panipat: 'HARYANA',
    ambala: 'HARYANA', karnal: 'HARYANA', rohtak: 'HARYANA', hisar: 'HARYANA', sonipat: 'HARYANA',

    noida: 'UTTAR_PRADESH', 'greater noida': 'UTTAR_PRADESH', ghaziabad: 'UTTAR_PRADESH',
    lucknow: 'UTTAR_PRADESH', kanpur: 'UTTAR_PRADESH', agra: 'UTTAR_PRADESH', varanasi: 'UTTAR_PRADESH',
    prayagraj: 'UTTAR_PRADESH', allahabad: 'UTTAR_PRADESH', meerut: 'UTTAR_PRADESH', bareilly: 'UTTAR_PRADESH',
    aligarh: 'UTTAR_PRADESH', moradabad: 'UTTAR_PRADESH', saharanpur: 'UTTAR_PRADESH', gorakhpur: 'UTTAR_PRADESH',
    jhansi: 'UTTAR_PRADESH', mathura: 'UTTAR_PRADESH',

    jaipur: 'RAJASTHAN', jodhpur: 'RAJASTHAN', udaipur: 'RAJASTHAN', kota: 'RAJASTHAN',
    bikaner: 'RAJASTHAN', ajmer: 'RAJASTHAN', bhilwara: 'RAJASTHAN', alwar: 'RAJASTHAN', sikar: 'RAJASTHAN',

    ahmedabad: 'GUJARAT', surat: 'GUJARAT', vadodara: 'GUJARAT', baroda: 'GUJARAT',
    rajkot: 'GUJARAT', bhavnagar: 'GUJARAT', jamnagar: 'GUJARAT', junagadh: 'GUJARAT',
    gandhinagar: 'GUJARAT', anand: 'GUJARAT', navsari: 'GUJARAT',

    hyderabad: 'TELANGANA', secunderabad: 'TELANGANA', warangal: 'TELANGANA', nizamabad: 'TELANGANA',
    khammam: 'TELANGANA', karimnagar: 'TELANGANA',

    visakhapatnam: 'ANDHRA_PRADESH', vizag: 'ANDHRA_PRADESH', vijayawada: 'ANDHRA_PRADESH',
    guntur: 'ANDHRA_PRADESH', nellore: 'ANDHRA_PRADESH', tirupati: 'ANDHRA_PRADESH',
    kakinada: 'ANDHRA_PRADESH', rajahmundry: 'ANDHRA_PRADESH', kadapa: 'ANDHRA_PRADESH', anantapur: 'ANDHRA_PRADESH',

    chennai: 'TAMIL_NADU', madras: 'TAMIL_NADU', coimbatore: 'TAMIL_NADU', madurai: 'TAMIL_NADU',
    tiruchirappalli: 'TAMIL_NADU', trichy: 'TAMIL_NADU', salem: 'TAMIL_NADU', tiruppur: 'TAMIL_NADU',
    erode: 'TAMIL_NADU', vellore: 'TAMIL_NADU', tirunelveli: 'TAMIL_NADU', thoothukudi: 'TAMIL_NADU',

    kolkata: 'WEST_BENGAL', calcutta: 'WEST_BENGAL', howrah: 'WEST_BENGAL', durgapur: 'WEST_BENGAL',
    asansol: 'WEST_BENGAL', siliguri: 'WEST_BENGAL', bardhaman: 'WEST_BENGAL', kharagpur: 'WEST_BENGAL',

    patna: 'BIHAR', gaya: 'BIHAR', bhagalpur: 'BIHAR', muzaffarpur: 'BIHAR', purnia: 'BIHAR', darbhanga: 'BIHAR',

    bhopal: 'MADHYA_PRADESH', indore: 'MADHYA_PRADESH', jabalpur: 'MADHYA_PRADESH', gwalior: 'MADHYA_PRADESH',
    ujjain: 'MADHYA_PRADESH', sagar: 'MADHYA_PRADESH', dewas: 'MADHYA_PRADESH', satna: 'MADHYA_PRADESH',

    ludhiana: 'PUNJAB', amritsar: 'PUNJAB', jalandhar: 'PUNJAB', patiala: 'PUNJAB', bathinda: 'PUNJAB', mohali: 'PUNJAB',

    chandigarh: 'CHANDIGARH',

    shimla: 'HIMACHAL_PRADESH', dharamshala: 'HIMACHAL_PRADESH', manali: 'HIMACHAL_PRADESH', solan: 'HIMACHAL_PRADESH',

    dehradun: 'UTTARAKHAND', haridwar: 'UTTARAKHAND', roorkee: 'UTTARAKHAND', haldwani: 'UTTARAKHAND', rishikesh: 'UTTARAKHAND',

    ranchi: 'JHARKHAND', jamshedpur: 'JHARKHAND', dhanbad: 'JHARKHAND', bokaro: 'JHARKHAND',

    raipur: 'CHHATTISGARH', bhilai: 'CHHATTISGARH', bilaspur: 'CHHATTISGARH', korba: 'CHHATTISGARH', durg: 'CHHATTISGARH',

    bhubaneswar: 'ODISHA', cuttack: 'ODISHA', rourkela: 'ODISHA', puri: 'ODISHA', sambalpur: 'ODISHA',

    kochi: 'KERALA', cochin: 'KERALA', thiruvananthapuram: 'KERALA', trivandrum: 'KERALA',
    kozhikode: 'KERALA', calicut: 'KERALA', thrissur: 'KERALA', kollam: 'KERALA', palakkad: 'KERALA',

    panaji: 'GOA', panjim: 'GOA', margao: 'GOA', 'vasco da gama': 'GOA', mapusa: 'GOA',

    srinagar: 'JAMMU_AND_KASHMIR', jammu: 'JAMMU_AND_KASHMIR',
    leh: 'LADAKH', kargil: 'LADAKH',
    guwahati: 'ASSAM', silchar: 'ASSAM', dibrugarh: 'ASSAM', jorhat: 'ASSAM'
  };

  for (const [key, stateEnum] of Object.entries(CITY_STATE_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return stateEnum;
    }
  }

  return null;
};

/**
 * Helper function: Gets human readable display name for state enum
 */
export const getStateDisplayName = (enumValue) => {
  if (!enumValue) return '';
  const found = INDIAN_STATES.find(s => s.enumValue === enumValue || s.displayName.toLowerCase() === enumValue.toLowerCase());
  return found ? found.displayName : enumValue.replace(/_/g, ' ');
};

/**
 * Helper function: Generates dynamic GST tax breakdown notice based on selected State & GSTIN
 */
export const getGstInvoiceNotice = (stateVal, gstinVal) => {
  const stateName = getStateDisplayName(stateVal);
  const isUT = ['CHANDIGARH', 'LAKSHADWEEP', 'ANDAMAN_AND_NICOBAR_ISLANDS', 'DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU', 'LADAKH'].includes(stateVal);
  const taxBreakdown = isUT ? 'CGST (9%) + UTGST (9%)' : 'CGST (9%) + SGST (9%)';
  const gstinPart = gstinVal ? ` and GSTIN: ${gstinVal}` : '';
  
  if (stateName) {
    return `When enabled, customer invoices in ${stateName} will include ${taxBreakdown} tax breakdown${gstinPart}.`;
  }
  return `When enabled, customer invoices will include ${taxBreakdown} tax breakdown${gstinPart}.`;
};

/**
 * Helper function: Gets list of major cities strictly for a given state enum
 */
export const getCitiesForState = (stateEnum, query = '') => {
  if (!stateEnum) return [];
  const lowerQuery = query.toLowerCase().trim();
  
  const STATE_CITIES_MAP = {
    MAHARASHTRA: ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Chhatrapati Sambhajinagar', 'Amravati', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar'],
    KARNATAKA: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Tumakuru', 'Shivamogga'],
    DELHI: ['Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
    HARYANA: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Rohtak', 'Hisar', 'Sonipat'],
    UTTAR_PRADESH: ['Noida', 'Greater Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Gorakhpur'],
    RAJASTHAN: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar'],
    GUJARAT: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand'],
    TELANGANA: ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
    ANDHRA_PRADESH: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kakinada', 'Rajahmundry', 'Kadapa'],
    TAMIL_NADU: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore'],
    WEST_BENGAL: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Kharagpur'],
    BIHAR: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga'],
    MADHYA_PRADESH: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
    PUNJAB: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
    CHANDIGARH: ['Chandigarh'],
    HIMACHAL_PRADESH: ['Shimla', 'Dharamshala', 'Manali', 'Solan'],
    UTTARAKHAND: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'],
    JHARKHAND: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
    CHHATTISGARH: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'],
    ODISHA: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur'],
    KERALA: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
    GOA: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
    JAMMU_AND_KASHMIR: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua'],
    LADAKH: ['Leh', 'Kargil'],
    PUDUCHERRY: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU: ['Daman', 'Diu', 'Silvassa', 'Dadra'],
    ANDAMAN_AND_NICOBAR_ISLANDS: ['Port Blair', 'Car Nicobar', 'Mayabunder'],
    LAKSHADWEEP: ['Kavaratti', 'Agatti', 'Minicoy', 'Amini'],
    ASSAM: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
    SIKKIM: ['Gangtok'],
    TRIPURA: ['Agartala'],
    MEGHALAYA: ['Shillong'],
    MIZORAM: ['Aizawl'],
    NAGALAND: ['Kohima', 'Dimapur'],
    MANIPUR: ['Imphal'],
    ARUNACHAL_PRADESH: ['Itanagar']
  };

  const stateKey = getStateFromStateName(stateEnum) || stateEnum;
  const cities = STATE_CITIES_MAP[stateKey] || [];
  if (!lowerQuery) return cities.map(c => ({ name: c, type: 'city' }));
  return cities
    .filter(c => c.toLowerCase().includes(lowerQuery))
    .map(c => ({ name: c, type: 'city' }));
};
