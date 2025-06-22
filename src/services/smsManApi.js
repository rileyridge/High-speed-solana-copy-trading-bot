
import axios from 'axios';

const SMSMAN_BASE_URL = 'http://api.sms-man.ru/control';

// Create axios instance with base configuration
const smsManClient = axios.create({
  baseURL: SMSMAN_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor to include token in all requests
smsManClient.interceptors.request.use((config) => {
  // Note: In a real frontend app, you'd get this from environment or secure storage
  // For this implementation, we'll rely on the Supabase edge function
  return config;
});

// Add response interceptor for consistent error handling
smsManClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('SMS-Man API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'API request failed');
  }
);

/**
 * Get account balance
 * @returns {Promise<Object>} Balance information
 */
export const getBalance = async () => {
  try {
    const response = await smsManClient.get('/getBalance', {
      params: { token: process.env.SMSMAN_API_TOKEN }
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
};

/**
 * Get account limits
 * @returns {Promise<Object>} Account limits information
 */
export const getLimits = async () => {
  try {
    const response = await smsManClient.get('/getLimits', {
      params: { token: process.env.SMSMAN_API_TOKEN }
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get limits: ${error.message}`);
  }
};

/**
 * Request a phone number for SMS verification
 * @param {string} countryId - Country ID
 * @param {string} applicationId - Application/service ID
 * @returns {Promise<Object>} Phone number and request ID
 */
export const getNumber = async (countryId, applicationId) => {
  if (!countryId || !applicationId) {
    throw new Error('Country ID and Application ID are required');
  }

  try {
    const response = await smsManClient.get('/getNumber', {
      params: {
        token: process.env.SMSMAN_API_TOKEN,
        country_id: countryId,
        application_id: applicationId
      }
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get number: ${error.message}`);
  }
};

/**
 * Get SMS code for a request
 * @param {string} requestId - Request ID from getNumber
 * @returns {Promise<Object>} SMS code or status
 */
export const getSms = async (requestId) => {
  if (!requestId) {
    throw new Error('Request ID is required');
  }

  try {
    const response = await smsManClient.get('/getSMS', {
      params: {
        token: process.env.SMSMAN_API_TOKEN,
        request_id: requestId
      }
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get SMS: ${error.message}`);
  }
};

/**
 * Set status for a request
 * @param {string} requestId - Request ID
 * @param {string} status - Status to set (reject, ready, etc.)
 * @returns {Promise<Object>} Status update result
 */
export const setStatus = async (requestId, status) => {
  if (!requestId || !status) {
    throw new Error('Request ID and status are required');
  }

  try {
    const response = await smsManClient.get('/setStatus', {
      params: {
        token: process.env.SMSMAN_API_TOKEN,
        request_id: requestId,
        status: status
      }
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to set status: ${error.message}`);
  }
};

/**
 * Get prices for services
 * @param {string} countryId - Optional country ID filter
 * @param {string} applicationId - Optional application ID filter
 * @returns {Promise<Object>} Pricing information
 */
export const getPrices = async (countryId = null, applicationId = null) => {
  try {
    const params = { token: process.env.SMSMAN_API_TOKEN };
    if (countryId) params.country_id = countryId;
    if (applicationId) params.application_id = applicationId;

    const response = await smsManClient.get('/getPrices', { params });
    return response;
  } catch (error) {
    throw new Error(`Failed to get prices: ${error.message}`);
  }
};

/**
 * Get list of available countries
 * @returns {Promise<Object>} Countries list
 */
export const getCountries = async () => {
  try {
    const response = await smsManClient.get('/getCountries', {
      params: { token: process.env.SMSMAN_API_TOKEN }
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get countries: ${error.message}`);
  }
};

/**
 * Get list of available applications/services
 * @returns {Promise<Object>} Applications list
 */
export const getApplications = async () => {
  try {
    const response = await smsManClient.get('/getApplications', {
      params: { token: process.env.SMSMAN_API_TOKEN }
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get applications: ${error.message}`);
  }
};

// Default export with all functions
const smsManApi = {
  getBalance,
  getLimits,
  getNumber,
  getSms,
  setStatus,
  getPrices,
  getCountries,
  getApplications
};

export default smsManApi;
