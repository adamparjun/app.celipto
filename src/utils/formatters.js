import { formatUnits, parseUnits } from 'ethers';

/**
 * Format a number as currency
 * @param {number|string} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
  const num = parseFloat(amount);
  
  if (isNaN(num)) return '$0.00';
  
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(decimals)}M`;
  }
  
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(decimals)}K`;
  }
  
  return `$${num.toFixed(decimals)}`;
};

/**
 * Format a number as a compact number
 * @param {number|string} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatCompactNumber = (amount, decimals = 2) => {
  const num = parseFloat(amount);
  
  if (isNaN(num)) return '0';
  
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  
  return num.toFixed(decimals);
};

/**
 * Format a percentage
 * @param {number|string} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimals = 2) => {
  const num = parseFloat(value);
  
  if (isNaN(num)) return '0%';
  
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format token amount from Wei
 * @param {string|BigInt} amount - Amount in Wei
 * @param {number} decimals - Token decimals
 * @param {number} displayDecimals - Display decimal places
 * @returns {string} Formatted token amount
 */
export const formatTokenAmount = (amount, decimals = 18, displayDecimals = 4) => {
  try {
    if (!amount) return '0';
    const formatted = formatUnits(amount.toString(), decimals);
    const num = parseFloat(formatted);
    return num.toFixed(displayDecimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * Parse token amount to Wei
 * @param {string} amount - Human readable amount
 * @param {number} decimals - Token decimals
 * @returns {BigInt} Amount in Wei
 */
export const parseTokenAmount = (amount, decimals = 18) => {
  try {
    if (!amount || amount === '0') return BigInt(0);
    return parseUnits(amount.toString(), decimals);
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return BigInt(0);
  }
};

/**
 * Format an Ethereum address
 * @param {string} address - Ethereum address
 * @param {number} prefixLength - Length of prefix to show
 * @param {number} suffixLength - Length of suffix to show
 * @returns {string} Shortened address
 */
export const formatAddress = (address, prefixLength = 6, suffixLength = 4) => {
  if (!address) return '';
  
  if (address.length <= prefixLength + suffixLength) return address;
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

/**
 * Format a transaction hash
 * @param {string} hash - Transaction hash
 * @returns {string} Shortened hash
 */
export const formatTxHash = (hash) => {
  return formatAddress(hash, 10, 8);
};

/**
 * Format a date to relative time
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format a date to readable string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format APY/APR
 * @param {number} rate - Interest rate (as decimal, e.g., 0.05 for 5%)
 * @param {boolean} isAPY - Whether it's APY (compounded) or APR
 * @returns {string} Formatted rate
 */
export const formatInterestRate = (rate, isAPY = true) => {
  const percentage = rate * 100;
  return `${percentage.toFixed(2)}% ${isAPY ? 'APY' : 'APR'}`;
};

/**
 * Calculate and format health factor
 * @param {number} collateral - Total collateral value
 * @param {number} debt - Total debt value
 * @param {number} liquidationThreshold - Liquidation threshold (e.g., 0.85)
 * @returns {string} Formatted health factor
 */
export const formatHealthFactor = (collateral, debt, liquidationThreshold = 0.85) => {
  if (debt === 0) return '∞';
  
  const healthFactor = (collateral * liquidationThreshold) / debt;
  
  if (healthFactor > 100) return '∞';
  
  return healthFactor.toFixed(2);
};

/**
 * Get health factor status
 * @param {number} healthFactor - Health factor value
 * @returns {object} Status with color and text
 */
export const getHealthFactorStatus = (healthFactor) => {
  if (healthFactor === Infinity || healthFactor > 10) {
    return { color: 'green', text: 'Healthy', emoji: '✅' };
  }
  
  if (healthFactor >= 2) {
    return { color: 'green', text: 'Safe', emoji: '✅' };
  }
  
  if (healthFactor >= 1.5) {
    return { color: 'yellow', text: 'Moderate', emoji: '⚠️' };
  }
  
  if (healthFactor >= 1.2) {
    return { color: 'orange', text: 'Warning', emoji: '⚠️' };
  }
  
  if (healthFactor >= 1.0) {
    return { color: 'red', text: 'Critical', emoji: '🚨' };
  }
  
  return { color: 'red', text: 'Liquidatable', emoji: '💀' };
};

/**
 * Format gas price in Gwei
 * @param {BigInt|string} gasPrice - Gas price in Wei
 * @returns {string} Formatted gas price
 */
export const formatGasPrice = (gasPrice) => {
  try {
    const gwei = formatUnits(gasPrice.toString(), 9);
    return `${parseFloat(gwei).toFixed(2)} Gwei`;
  } catch (error) {
    return '0 Gwei';
  }
};

/**
 * Format number with thousand separators
 * @param {number|string} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export const formatNumberWithCommas = (num, decimals = 2) => {
  const number = parseFloat(num);
  
  if (isNaN(number)) return '0';
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Validate and format input amount
 * @param {string} input - User input
 * @param {number} maxDecimals - Maximum decimal places allowed
 * @returns {string} Validated input
 */
export const validateAmountInput = (input, maxDecimals = 18) => {
  // Remove any non-numeric characters except decimal point
  let cleaned = input.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    cleaned = parts[0] + '.' + parts[1].slice(0, maxDecimals);
  }
  
  return cleaned;
};

/**
 * Calculate estimated gas cost
 * @param {BigInt} gasLimit - Gas limit
 * @param {BigInt} gasPrice - Gas price in Wei
 * @returns {string} Estimated cost in ETH
 */
export const calculateGasCost = (gasLimit, gasPrice) => {
  try {
    const cost = BigInt(gasLimit) * BigInt(gasPrice);
    return formatTokenAmount(cost, 18, 6);
  } catch (error) {
    return '0';
  }
};

export default {
  formatCurrency,
  formatCompactNumber,
  formatPercent,
  formatTokenAmount,
  parseTokenAmount,
  formatAddress,
  formatTxHash,
  formatRelativeTime,
  formatDate,
  formatInterestRate,
  formatHealthFactor,
  getHealthFactorStatus,
  formatGasPrice,
  formatNumberWithCommas,
  validateAmountInput,
  calculateGasCost,
};