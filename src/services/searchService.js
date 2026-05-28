import axiosInstance from '../api/axiosInstance';

const searchService = {
  /**
   * Search for city names
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
   * Search for area names within a city
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
  }
};

export default searchService;
