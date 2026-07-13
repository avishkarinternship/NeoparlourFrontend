import axiosInstance from '../api/axiosInstance';
import axios from 'axios';

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
   * @param {string} areaName - The name of the area
   * @returns {Promise<Object[]>} List of salon objects
   */
  getSalonsByLocation: async (cityName, areaName) => {
    try {
      const response = await axiosInstance.get(`/salons/location-search`, {
        params: { cityName, areaName }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching salons by location:', error);
      throw error;
    }
  },

  /**
   * Search for locations using Komoot Photon Autocomplete geocoding API (OSM backed)
   * @param {string} query - The search query (e.g. Bandra, Pune)
   * @param {string} [featureClass] - 'city' or 'area' to filter results
   * @param {string} [cityName] - Optional city name to restrict area matches
   * @returns {Promise<Array>} List of locality results
   */
  searchExternalLocations: async (query, featureClass = '', cityName = '', limit = 15) => {
    if (!query || query.trim().length < 2) return [];
    
    // Normalizes common city name variants (e.g. Bangalore vs Bengaluru)
    const normalizeCity = (name) => {
      const lower = name.toLowerCase().trim();
      if (lower === 'bangalore' || lower === 'bengaluru') return 'bengaluru';
      if (lower === 'mumbai' || lower === 'bombay') return 'mumbai';
      if (lower === 'calcutta' || lower === 'kolkata') return 'kolkata';
      if (lower === 'madras' || lower === 'chennai') return 'chennai';
      return lower;
    };

    try {
      let searchQuery = query;
      if (cityName && featureClass === 'area') {
        searchQuery = `${query} ${cityName}`;
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
      const results = [];
      const seen = new Set();
      
      for (const feature of features) {
        const props = feature.properties || {};
        
        // Extract city identifier (with rich fallback)
        const city = props.city || props.town || props.district || props.state_district || props.county || '';
        
        // Extract clean primary area name without street prefix hierarchies
        const rawName = props.name || '';
        const cleanName = rawName.split(',')[0].trim();
        
        if (featureClass === 'city') {
          // Priority clean city matching
          const matchedCity = props.city || (props.osm_value === 'city' || props.osm_value === 'town' ? props.name : '');
          if (matchedCity && !seen.has(matchedCity.toLowerCase())) {
            const normCity = matchedCity.toLowerCase();
            const normQuery = query.toLowerCase().trim();
            
            // Ensure the city name itself matches the query string (prefix or substring)
            if (normCity.includes(normQuery)) {
              seen.add(matchedCity.toLowerCase());
              results.push({ name: matchedCity, type: 'city' });
            }
          }
        } else if (featureClass === 'area') {
          const normSelectedCity = normalizeCity(cityName);
          
          // Verify if result belongs to selected metropolitan boundaries (broad check across all address fields)
          const matchesCity = !cityName || [
            props.city,
            props.town,
            props.district,
            props.state_district,
            props.county,
            props.state,
            rawName
          ].some(val => val && normalizeCity(val).includes(normSelectedCity));
          
          if (matchesCity) {
            // Gather all candidate area names from the feature properties
            const candidates = [];
            if (props.district) candidates.push(props.district);
            if (props.locality) candidates.push(props.locality);
            if (props.suburb) candidates.push(props.suburb);
            if (props.street) candidates.push(props.street);
            
            // Add name if it's not a POI and not equivalent to the city name itself
            if (cleanName && cleanName.toLowerCase() !== cityName.toLowerCase()) {
              const lowerClean = cleanName.toLowerCase();
              const isPoi = [
                'airport', 'station', 'bus', 'stand', 'stop', 'hospital', 'university', 'college',
                'school', 'junction', 'metro', 'railway', 'temple', 'church', 'mosque', 'mall', 'plaza'
              ].some(k => lowerClean.includes(k));
              if (!isPoi) {
                candidates.push(cleanName);
              }
            }

            for (let cand of candidates) {
              cand = cand.trim();
              if (!cand || cand.length < 3) continue;

              // Skip if suggestion matches the city name itself
              if (cand.toLowerCase() === cityName.toLowerCase()) continue;

              // Filter out common metadata / POI words from candidates
              const lowerCand = cand.toLowerCase();
              const isExcluded = [
                'district', 'subdistrict', 'state', 'country', 'postcode', 'pin code', 'subdivision', 'division',
                'station', 'junction', 'airport', 'railway', 'bus stop', 'bus stand', 'metro line', 'metro station',
                'university', 'college', 'school', 'hospital', 'clinic', 'library', 'garden', 'park', 'zoo',
                'museum', 'police station', 'temple', 'church', 'mosque', 'terminal', 'depot', 'deppo'
              ].some(k => lowerCand.includes(k));
              if (isExcluded) continue;

              const subLocality = props.district || props.locality || props.suburb || '';
              const parentCity = city && normalizeCity(city) !== normSelectedCity ? `${city}, ${cityName}` : (city || cityName);
              const displayCity = subLocality && subLocality !== cand ? `${subLocality}, ${parentCity}` : parentCity;

              const uniqueKey = `${cand.toLowerCase()}_${displayCity.toLowerCase()}`;
              if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                results.push({ 
                  name: cand, 
                  city: displayCity, 
                  type: 'area' 
                });
              }
            }
          }
        } else {
          // Unstructured fallback search
          if (cleanName) {
            const label = city ? `${cleanName}, ${city}` : cleanName;
            if (!seen.has(label.toLowerCase())) {
              seen.add(label.toLowerCase());
              results.push({ label, city, area: cleanName });
            }
          }
        }
      }
      
      // Sort results to prioritize exact prefix matches of the user's typed area query
      const lowerQuery = query.toLowerCase().trim();
      results.sort((a, b) => {
        const nameA = (a.name || a.label || '').toLowerCase();
        const nameB = (b.name || b.label || '').toLowerCase();
        
        const startsA = nameA.startsWith(lowerQuery);
        const startsB = nameB.startsWith(lowerQuery);
        
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;
        
        const containsA = nameA.includes(lowerQuery);
        const containsB = nameB.includes(lowerQuery);
        
        if (containsA && !containsB) return -1;
        if (!containsA && containsB) return 1;
        
        return 0; // Maintain original Photon relevance score ranking
      });
      
      return results;
    } catch (error) {
      console.error('Error searching external locations via Photon:', error);
      return [];
    }
  },

  /**
   * Reverse geocode coordinates to find city and area names using Komoot Photon API
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<{city: string, area: string}>} Geocoded location result
   */
  reverseGeocode: async (lat, lon) => {
    try {
      const url = `https://photon.komoot.io/reverse`;
      const response = await axios.get(url, {
        params: { lat, lon }
      });
      
      const features = response.data?.features || [];
      if (features.length === 0) {
        return { city: '', area: '' };
      }
      
      const props = features[0].properties || {};
      
      // Helper to extract a clean city name from county or city properties
      const extractCleanCity = (p) => {
        const candidates = [p.county, p.city, p.town, p.state_district, p.district];
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
            if (lower === 'bengaluru' || lower === 'bangalore') return 'Bengaluru';
            if (lower === 'mumbai' || lower === 'bombay') return 'Mumbai';
            if (lower === 'calcutta' || lower === 'kolkata') return 'Kolkata';
            if (lower === 'madras' || lower === 'chennai') return 'Chennai';
            return name;
          }
        }
        return '';
      };
      
      const city = extractCleanCity(props) || props.city || '';
      
      // Extract broader area name (prioritizing locality, suburb, or district over POI/building name)
      const area = props.locality || props.suburb || props.district || props.name || props.street || '';
      
      return {
        city: city.trim(),
        area: area.trim()
      };
    } catch (error) {
      console.error('Error reverse geocoding via Photon:', error);
      throw error;
    }
  }
};

export default searchService;
