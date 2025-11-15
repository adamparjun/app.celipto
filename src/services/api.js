import axios from 'axios';
import { API_ENDPOINTS } from '@/utils/constants';

/**
 * Create axios instance with default config
 */
const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 */
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Get token prices from CoinGecko
 * @param {string[]} tokenIds - Array of CoinGecko token IDs
 * @returns {Promise<object>} Token prices
 */
export const getTokenPrices = async (tokenIds) => {
  try {
    const ids = tokenIds.join(',');
    const response = await api.get(`${API_ENDPOINTS.COINGECKO}/simple/price`, {
      params: {
        ids,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw error;
  }
};

/**
 * Get token price history
 * @param {string} tokenId - CoinGecko token ID
 * @param {number} days - Number of days (1, 7, 30, 90, 365)
 * @returns {Promise<object>} Price history data
 */
export const getTokenPriceHistory = async (tokenId, days = 30) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.COINGECKO}/coins/${tokenId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days,
          interval: days === 1 ? 'hourly' : 'daily',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

/**
 * Get detailed token information
 * @param {string} tokenId - CoinGecko token ID
 * @returns {Promise<object>} Token details
 */
export const getTokenDetails = async (tokenId) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.COINGECKO}/coins/${tokenId}`,
      {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw error;
  }
};

/**
 * Get DeFi protocol TVL data
 * @returns {Promise<object>} TVL data
 */
export const getDeFiTVL = async () => {
  try {
    const response = await api.get('https://api.llama.fi/protocols');
    return response.data;
  } catch (error) {
    console.error('Error fetching DeFi TVL:', error);
    throw error;
  }
};

/**
 * Get gas price from Etherscan
 * @returns {Promise<object>} Gas price data
 */
export const getGasPrice = async () => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    const response = await api.get(API_ENDPOINTS.ETHERSCAN, {
      params: {
        module: 'gastracker',
        action: 'gasoracle',
        apikey: apiKey,
      },
    });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching gas price:', error);
    throw error;
  }
};

/**
 * Get transaction status from Etherscan
 * @param {string} txHash - Transaction hash
 * @returns {Promise<object>} Transaction status
 */
export const getTransactionStatus = async (txHash) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    const response = await api.get(API_ENDPOINTS.ETHERSCAN, {
      params: {
        module: 'transaction',
        action: 'gettxreceiptstatus',
        txhash: txHash,
        apikey: apiKey,
      },
    });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    throw error;
  }
};

/**
 * Get user transaction history
 * @param {string} address - Ethereum address
 * @param {number} page - Page number
 * @param {number} offset - Items per page
 * @returns {Promise<object>} Transaction history
 */
export const getUserTransactions = async (address, page = 1, offset = 10) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    const response = await api.get(API_ENDPOINTS.ETHERSCAN, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        page,
        offset,
        sort: 'desc',
        apikey: apiKey,
      },
    });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

/**
 * Get ERC20 token transfers
 * @param {string} address - Ethereum address
 * @param {string} contractAddress - Token contract address (optional)
 * @returns {Promise<object>} Token transfers
 */
export const getTokenTransfers = async (address, contractAddress = null) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    const params = {
      module: 'account',
      action: 'tokentx',
      address,
      sort: 'desc',
      apikey: apiKey,
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const response = await api.get(API_ENDPOINTS.ETHERSCAN, { params });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching token transfers:', error);
    throw error;
  }
};

/**
 * Get trending tokens
 * @returns {Promise<object>} Trending tokens
 */
export const getTrendingTokens = async () => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.COINGECKO}/search/trending`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    throw error;
  }
};

/**
 * Get market data overview
 * @returns {Promise<object>} Market overview
 */
export const getMarketOverview = async () => {
  try {
    const response = await api.get(`${API_ENDPOINTS.COINGECKO}/global`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching market overview:', error);
    throw error;
  }
};

/**
 * Search tokens
 * @param {string} query - Search query
 * @returns {Promise<object>} Search results
 */
export const searchTokens = async (query) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.COINGECKO}/search`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching tokens:', error);
    throw error;
  }
};

/**
 * Get lending pool statistics (mock - replace with actual API)
 * @returns {Promise<object>} Pool statistics
 */
export const getLendingPoolStats = async () => {
  try {
    // This would be replaced with actual lending protocol API
    return {
      totalValueLocked: 15420000000, // $15.42B
      totalBorrowed: 8230000000, // $8.23B
      totalSupplied: 15420000000,
      utilizationRate: 53.4,
      numberOfUsers: 145230,
      numberOfTransactions: 2340567,
    };
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    throw error;
  }
};

/**
 * Get interest rate history
 * @param {string} asset - Asset address
 * @param {number} days - Number of days
 * @returns {Promise<object>} Interest rate history
 */
export const getInterestRateHistory = async (asset, days = 30) => {
  try {
    // Mock data - replace with actual API
    const history = [];
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      history.push({
        date: date.toISOString().split('T')[0],
        supplyRate: 3 + Math.random() * 2,
        borrowRate: 5 + Math.random() * 3,
      });
    }
    
    return history;
  } catch (error) {
    console.error('Error fetching interest rate history:', error);
    throw error;
  }
};

/**
 * Submit user feedback
 * @param {object} feedback - Feedback data
 * @returns {Promise<object>} Response
 */
export const submitFeedback = async (feedback) => {
  try {
    // This would post to your backend
    const response = await api.post('/api/feedback', feedback);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Get notification settings
 * @param {string} address - User address
 * @returns {Promise<object>} Notification settings
 */
export const getNotificationSettings = async (address) => {
  try {
    const response = await api.get(`/api/notifications/${address}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

/**
 * Update notification settings
 * @param {string} address - User address
 * @param {object} settings - Notification settings
 * @returns {Promise<object>} Updated settings
 */
export const updateNotificationSettings = async (address, settings) => {
  try {
    const response = await api.put(`/api/notifications/${address}`, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

export default {
  getTokenPrices,
  getTokenPriceHistory,
  getTokenDetails,
  getDeFiTVL,
  getGasPrice,
  getTransactionStatus,
  getUserTransactions,
  getTokenTransfers,
  getTrendingTokens,
  getMarketOverview,
  searchTokens,
  getLendingPoolStats,
  getInterestRateHistory,
  submitFeedback,
  getNotificationSettings,
  updateNotificationSettings,
};