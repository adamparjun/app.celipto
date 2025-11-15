import { getTokenPrices, getTokenPriceHistory } from './api';
import { SUPPORTED_TOKENS } from '@/utils/constants';

/**
 * Price service for fetching and caching token prices
 */

// Price cache
const priceCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

/**
 * Token ID mapping for CoinGecko
 */
const TOKEN_ID_MAP = {
  ETH: 'ethereum',
  WETH: 'weth',
  WBTC: 'wrapped-bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  COMP: 'compound-governance-token',
};

/**
 * Get token ID from symbol
 * @param {string} symbol - Token symbol
 * @returns {string} CoinGecko token ID
 */
export const getTokenId = (symbol) => {
  return TOKEN_ID_MAP[symbol] || symbol.toLowerCase();
};

/**
 * Check if price is cached and fresh
 * @param {string} key - Cache key
 * @returns {object|null} Cached price or null
 */
const getCachedPrice = (key) => {
  const cached = priceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

/**
 * Set price in cache
 * @param {string} key - Cache key
 * @param {object} data - Price data
 */
const setCachedPrice = (key, data) => {
  priceCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Get current price for a single token
 * @param {string} symbol - Token symbol
 * @returns {Promise<object>} Price data
 */
export const getTokenPrice = async (symbol) => {
  const cacheKey = `price_${symbol}`;
  const cached = getCachedPrice(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const tokenId = getTokenId(symbol);
    const prices = await getTokenPrices([tokenId]);
    
    const priceData = {
      symbol,
      price: prices[tokenId]?.usd || 0,
      change24h: prices[tokenId]?.usd_24h_change || 0,
      marketCap: prices[tokenId]?.usd_market_cap || 0,
      timestamp: Date.now(),
    };

    setCachedPrice(cacheKey, priceData);
    return priceData;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    
    // Return cached data even if expired, or fallback
    const cached = priceCache.get(cacheKey);
    if (cached) return cached.data;
    
    return {
      symbol,
      price: 0,
      change24h: 0,
      marketCap: 0,
      timestamp: Date.now(),
    };
  }
};

/**
 * Get prices for multiple tokens
 * @param {string[]} symbols - Array of token symbols
 * @returns {Promise<object>} Object with symbol as key and price data as value
 */
export const getMultipleTokenPrices = async (symbols) => {
  const cacheKey = `prices_${symbols.sort().join('_')}`;
  const cached = getCachedPrice(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const tokenIds = symbols.map(getTokenId);
    const prices = await getTokenPrices(tokenIds);
    
    const priceData = {};
    
    symbols.forEach((symbol) => {
      const tokenId = getTokenId(symbol);
      priceData[symbol] = {
        symbol,
        price: prices[tokenId]?.usd || 0,
        change24h: prices[tokenId]?.usd_24h_change || 0,
        marketCap: prices[tokenId]?.usd_market_cap || 0,
        timestamp: Date.now(),
      };
    });

    setCachedPrice(cacheKey, priceData);
    return priceData;
  } catch (error) {
    console.error('Error fetching multiple token prices:', error);
    
    // Return cached or fallback data
    const cached = priceCache.get(cacheKey);
    if (cached) return cached.data;
    
    const fallbackData = {};
    symbols.forEach((symbol) => {
      fallbackData[symbol] = {
        symbol,
        price: 0,
        change24h: 0,
        marketCap: 0,
        timestamp: Date.now(),
      };
    });
    
    return fallbackData;
  }
};

/**
 * Get all supported token prices
 * @returns {Promise<object>} All token prices
 */
export const getAllTokenPrices = async () => {
  const symbols = SUPPORTED_TOKENS.map((token) => token.symbol);
  return await getMultipleTokenPrices(symbols);
};

/**
 * Get price history for a token
 * @param {string} symbol - Token symbol
 * @param {number} days - Number of days (1, 7, 30, 90, 365)
 * @returns {Promise<array>} Price history data
 */
export const getPriceHistory = async (symbol, days = 30) => {
  const cacheKey = `history_${symbol}_${days}`;
  const cached = getCachedPrice(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const tokenId = getTokenId(symbol);
    const data = await getTokenPriceHistory(tokenId, days);
    
    // Format the data
    const history = data.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp).toISOString().split('T')[0],
      price,
    }));

    setCachedPrice(cacheKey, history);
    return history;
  } catch (error) {
    console.error(`Error fetching price history for ${symbol}:`, error);
    
    // Return cached or empty array
    const cached = priceCache.get(cacheKey);
    if (cached) return cached.data;
    
    return [];
  }
};

/**
 * Calculate price change percentage
 * @param {number} currentPrice - Current price
 * @param {number} previousPrice - Previous price
 * @returns {number} Change percentage
 */
export const calculatePriceChange = (currentPrice, previousPrice) => {
  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

/**
 * Get price at specific timestamp from history
 * @param {array} history - Price history array
 * @param {number} timestamp - Target timestamp
 * @returns {number} Price at timestamp
 */
export const getPriceAtTimestamp = (history, timestamp) => {
  if (!history || history.length === 0) return 0;
  
  // Find closest price entry
  const closest = history.reduce((prev, curr) => {
    return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp)
      ? curr
      : prev;
  });
  
  return closest.price;
};

/**
 * Calculate average price from history
 * @param {array} history - Price history array
 * @returns {number} Average price
 */
export const getAveragePrice = (history) => {
  if (!history || history.length === 0) return 0;
  
  const sum = history.reduce((total, entry) => total + entry.price, 0);
  return sum / history.length;
};

/**
 * Get highest and lowest prices from history
 * @param {array} history - Price history array
 * @returns {object} { high, low }
 */
export const getHighLowPrices = (history) => {
  if (!history || history.length === 0) {
    return { high: 0, low: 0 };
  }
  
  const prices = history.map((entry) => entry.price);
  return {
    high: Math.max(...prices),
    low: Math.min(...prices),
  };
};

/**
 * Format price with appropriate decimals
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  if (price === 0) return '$0.00';
  
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  
  if (price < 100) {
    return `$${price.toFixed(2)}`;
  }
  
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Get price trend (up, down, neutral)
 * @param {array} history - Price history array
 * @param {number} period - Period to check (in entries)
 * @returns {string} Trend direction
 */
export const getPriceTrend = (history, period = 24) => {
  if (!history || history.length < period) return 'neutral';
  
  const recentHistory = history.slice(-period);
  const firstPrice = recentHistory[0].price;
  const lastPrice = recentHistory[recentHistory.length - 1].price;
  
  const change = calculatePriceChange(lastPrice, firstPrice);
  
  if (change > 1) return 'up';
  if (change < -1) return 'down';
  return 'neutral';
};

/**
 * Calculate volatility from price history
 * @param {array} history - Price history array
 * @returns {number} Volatility percentage
 */
export const calculateVolatility = (history) => {
  if (!history || history.length < 2) return 0;
  
  const prices = history.map((entry) => entry.price);
  const average = getAveragePrice(history);
  
  // Calculate standard deviation
  const squaredDiffs = prices.map((price) => Math.pow(price - average, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / prices.length;
  const standardDeviation = Math.sqrt(avgSquaredDiff);
  
  // Return as percentage of average
  return (standardDeviation / average) * 100;
};

/**
 * Clear price cache
 */
export const clearPriceCache = () => {
  priceCache.clear();
  console.log('Price cache cleared');
};

/**
 * Subscribe to price updates (polling)
 * @param {string[]} symbols - Symbols to watch
 * @param {function} callback - Callback function
 * @param {number} interval - Update interval in ms
 * @returns {function} Unsubscribe function
 */
export const subscribeToPriceUpdates = (symbols, callback, interval = 60000) => {
  const updatePrices = async () => {
    const prices = await getMultipleTokenPrices(symbols);
    callback(prices);
  };
  
  // Initial fetch
  updatePrices();
  
  // Set up polling
  const intervalId = setInterval(updatePrices, interval);
  
  // Return unsubscribe function
  return () => {
    clearInterval(intervalId);
  };
};

export default {
  getTokenId,
  getTokenPrice,
  getMultipleTokenPrices,
  getAllTokenPrices,
  getPriceHistory,
  calculatePriceChange,
  getPriceAtTimestamp,
  getAveragePrice,
  getHighLowPrices,
  formatPrice,
  getPriceTrend,
  calculateVolatility,
  clearPriceCache,
  subscribeToPriceUpdates,
};