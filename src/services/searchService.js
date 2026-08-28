import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { getStateFromStateName, getStateFromCityName, getStateDisplayName, getCitiesForState } from '../constants/indianStates';

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
   * @param {string} [stateName] - Optional state name/enum to restrict city/area matches
   * @returns {Promise<Array>} List of locality results
   */
  searchExternalLocations: async (query = '', featureClass = '', cityName = '', stateName = '', limit = 15) => {
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
      const cleanState = stateName ? getStateDisplayName(stateName) : '';
      const results = [];
      const seen = new Set();

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
          const normSelectedCity = normalizeCity(cityName);
          
          // Verify if result strictly belongs to the selected city boundaries
          const matchesCity = !cityName || [
            props.city,
            props.town,
            props.district,
            props.state_district,
            props.county,
            props.locality,
            props.suburb
          ].some(val => {
            if (!val) return false;
            const normVal = normalizeCity(val);
            return normVal === normSelectedCity || normVal.includes(normSelectedCity);
          });
          
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
              const lowerCand = cand.toLowerCase();
              if (lowerCand === cityName.toLowerCase() || normalizeCity(cand) === normSelectedCity) continue;

              // Prevent district cross-matching (e.g. don't suggest East Delhi when South Delhi is selected)
              const delhiDistricts = ['north delhi', 'south delhi', 'east delhi', 'west delhi', 'central delhi', 'new delhi'];
              if (delhiDistricts.includes(lowerCand) && lowerCand !== cityName.toLowerCase()) {
                continue;
              }

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

              const uniqueKey = `${cand.toLowerCase()}_${displayCity.toLowerCase()}`;
              if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                results.push({ 
                  name: cand, 
                  district: props.district || props.suburb || props.locality || '',
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
        return nameA.localeCompare(nameB);
      });
      
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching external locations via Photon:', error);
      return [];
    }
  },

  /**
   * Reverse geocode lat/lng to get city and area details via Photon API
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<{city: string, area: string, stateName: string, stateEnum: string}>}
   */
  reverseGeocode: async (lat, lng) => {
    try {
      const url = `https://photon.komoot.io/reverse`;
      const response = await axios.get(url, {
        params: {
          lat: lat,
          lon: lng
        }
      });
      
      const features = response.data?.features || [];
      if (features.length === 0) {
        return { city: '', area: '', stateName: '', stateEnum: '' };
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
      const rawState = props.state || '';
      const stateEnum = getStateFromStateName(rawState) || getStateFromCityName(city.trim()) || null;
      
      return {
        city: city.trim(),
        area: area.trim(),
        stateName: rawState,
        stateEnum: stateEnum
      };
    } catch (error) {
      console.error('Error reverse geocoding via Photon:', error);
      throw error;
    }
  },

  /**
   * Search for real-world POI landmarks (Hospitals, Colleges, Malls, Stations, Buildings, etc.)
   * Uses multi-pass district-aware fallback search
   * @param {string} query - Search term for landmark (e.g. Siddhi, Hospital)
   * @param {string} [areaName] - Area name filter
   * @param {string} [cityName] - City name filter
   * @param {string} [stateName] - State name filter
   * @param {string} [districtName] - District name associated with area
   * @param {number} [limit=10]
   * @returns {Promise<Array>} List of landmark objects { name, type, details }
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

      // Query 3: City-wide search (Landmark + City + State) -> ALWAYS GUARANTEES CITY LANDMARKS ARE FOUND
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

        // Calculate relevance rank (give bonus if feature mentions areaName or districtName)
        let rankScore = 0;
        if (normDistrict && (lowerName.includes(normDistrict) || lowerDetails.includes(normDistrict))) {
          rankScore += 10;
        }
        if (normArea && (lowerName.includes(normArea) || lowerDetails.includes(normArea))) {
          rankScore += 10;
        }

        results.push({
          name: name.trim(),
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
