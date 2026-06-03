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
  searchExternalLocations: async (query, featureClass = '', cityName = '') => {
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
          limit: 15
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
          
          // Verify if result belongs to selected metropolitan boundaries
          const matchesCity = !cityName || 
            normalizeCity(city).includes(normSelectedCity) || 
            normSelectedCity.includes(normalizeCity(city)) || 
            rawName.toLowerCase().includes(cityName.toLowerCase());
          
          // Skip if suggestions are exactly duplicate of the city name
          if (cleanName.toLowerCase() === cityName.toLowerCase()) {
            continue;
          }

          if (cleanName && matchesCity) {
            const uniqueKey = `${cleanName.toLowerCase()}_${city.toLowerCase()}`;
            if (!seen.has(uniqueKey)) {
              seen.add(uniqueKey);
              results.push({ 
                name: cleanName, 
                city: city || cityName, 
                type: 'area' 
              });
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
  }
};

export default searchService;
