import { useState, useCallback, useMemo } from 'react';
import { useContract } from './useContract';
import { useWallet } from './useWallet';
import { SUPPORTED_TOKENS } from '@/utils/constants';
import { formatCurrency, formatPercent } from '@/utils/formatters';

/**
 * Custom hook for supply/deposit operations
 */
export const useSupply = () => {
  const { 
    supplies, 
    totalSupplied, 
    supply: supplyToPool, 
    withdraw: withdrawFromPool,
    isLoading,
    error: contractError 
  } = useContract();
  
  const { account, balance, isConnected } = useWallet();
  
  const [selectedToken, setSelectedToken] = useState(null);
  const [supplyAmount, setSupplyAmount] = useState('');
  const [error, setError] = useState(null);

  /**
   * Calculate total supply APY (weighted average)
   */
  const averageSupplyAPY = useMemo(() => {
    if (supplies.length === 0) return 0;
    
    const totalValue = supplies.reduce((sum, s) => sum + (s.amount * s.token.price), 0);
    if (totalValue === 0) return 0;
    
    const weightedAPY = supplies.reduce((sum, s) => {
      const weight = (s.amount * s.token.price) / totalValue;
      return sum + (s.apy * weight);
    }, 0);
    
    return weightedAPY;
  }, [supplies]);

  /**
   * Calculate estimated earnings
   */
  const estimatedEarnings = useMemo(() => {
    if (supplies.length === 0) return { daily: 0, monthly: 0, yearly: 0 };
    
    const yearlyEarnings = supplies.reduce((sum, s) => {
      const value = s.amount * s.token.price;
      return sum + (value * s.apy / 100);
    }, 0);
    
    return {
      daily: yearlyEarnings / 365,
      monthly: yearlyEarnings / 12,
      yearly: yearlyEarnings,
    };
  }, [supplies]);

  /**
   * Get supply by ID
   */
  const getSupplyById = useCallback((id) => {
    return supplies.find(s => s.id === id);
  }, [supplies]);

  /**
   * Get supplies by token symbol
   */
  const getSuppliesByToken = useCallback((symbol) => {
    return supplies.filter(s => s.token.symbol === symbol);
  }, [supplies]);

  /**
   * Validate supply amount
   */
  const validateSupplyAmount = useCallback((amount, token) => {
    setError(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (!token) {
      setError('Please select a token');
      return false;
    }

    // For native ETH, check balance
    if (token.isNative) {
      const amountNum = parseFloat(amount);
      const balanceNum = parseFloat(balance);
      
      if (amountNum > balanceNum) {
        setError(`Insufficient balance. You have ${formatCurrency(balanceNum)} ETH`);
        return false;
      }
    }

    return true;
  }, [balance]);

  /**
   * Supply tokens
   */
  const supply = useCallback(async (token, amount) => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return null;
    }

    if (!validateSupplyAmount(amount, token)) {
      return null;
    }

    try {
      setError(null);
      const receipt = await supplyToPool(token, amount);
      
      // Reset form
      setSupplyAmount('');
      setSelectedToken(null);
      
      return receipt;
    } catch (err) {
      setError(err.message || 'Failed to supply tokens');
      throw err;
    }
  }, [isConnected, validateSupplyAmount, supplyToPool]);

  /**
   * Withdraw tokens
   */
  const withdraw = useCallback(async (supplyId, amount = null) => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return null;
    }

    try {
      setError(null);
      const receipt = await withdrawFromPool(supplyId, amount);
      return receipt;
    } catch (err) {
      setError(err.message || 'Failed to withdraw tokens');
      throw err;
    }
  }, [isConnected, withdrawFromPool]);

  /**
   * Get available tokens for supply
   */
  const availableTokens = useMemo(() => {
    return SUPPORTED_TOKENS.map(token => ({
      ...token,
      currentSupply: supplies
        .filter(s => s.token.symbol === token.symbol)
        .reduce((sum, s) => sum + s.amount, 0),
    }));
  }, [supplies]);

  /**
   * Get top supply by value
   */
  const topSupply = useMemo(() => {
    if (supplies.length === 0) return null;
    
    return supplies.reduce((max, s) => {
      const value = s.amount * s.token.price;
      const maxValue = max ? max.amount * max.token.price : 0;
      return value > maxValue ? s : max;
    }, null);
  }, [supplies]);

  /**
   * Format supply summary
   */
  const supplySummary = useMemo(() => {
    return {
      totalSupplied: formatCurrency(totalSupplied),
      averageAPY: formatPercent(averageSupplyAPY),
      totalPositions: supplies.length,
      dailyEarnings: formatCurrency(estimatedEarnings.daily),
      monthlyEarnings: formatCurrency(estimatedEarnings.monthly),
      yearlyEarnings: formatCurrency(estimatedEarnings.yearly),
    };
  }, [totalSupplied, averageSupplyAPY, supplies.length, estimatedEarnings]);

  return {
    // State
    supplies,
    totalSupplied,
    selectedToken,
    supplyAmount,
    isLoading,
    error: error || contractError,
    
    // Computed
    averageSupplyAPY,
    estimatedEarnings,
    availableTokens,
    topSupply,
    supplySummary,
    
    // Setters
    setSelectedToken,
    setSupplyAmount,
    setError,
    
    // Methods
    supply,
    withdraw,
    getSupplyById,
    getSuppliesByToken,
    validateSupplyAmount,
  };
};

export default useSupply;