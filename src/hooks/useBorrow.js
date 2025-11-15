import { useState, useCallback, useMemo } from 'react';
import { useContract } from './useContract';
import { useWallet } from './useWallet';
import { SUPPORTED_TOKENS, HEALTH_FACTOR } from '@/utils/constants';
import { formatCurrency, formatPercent, formatHealthFactor, getHealthFactorStatus } from '@/utils/formatters';

/**
 * Custom hook for borrow operations
 */
export const useBorrow = () => {
  const { 
    borrows, 
    totalBorrowed,
    totalSupplied,
    healthFactor,
    availableToBorrow,
    borrow: borrowFromPool, 
    repay: repayToPool,
    isLoading,
    error: contractError 
  } = useContract();
  
  const { isConnected } = useWallet();
  
  const [selectedToken, setSelectedToken] = useState(null);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [error, setError] = useState(null);

  /**
   * Calculate total borrow APY (weighted average)
   */
  const averageBorrowAPY = useMemo(() => {
    if (borrows.length === 0) return 0;
    
    const totalValue = borrows.reduce((sum, b) => sum + (b.amount * b.token.price), 0);
    if (totalValue === 0) return 0;
    
    const weightedAPY = borrows.reduce((sum, b) => {
      const weight = (b.amount * b.token.price) / totalValue;
      return sum + (b.apy * weight);
    }, 0);
    
    return weightedAPY;
  }, [borrows]);

  /**
   * Calculate total interest to pay
   */
  const estimatedInterest = useMemo(() => {
    if (borrows.length === 0) return { daily: 0, monthly: 0, yearly: 0 };
    
    const yearlyInterest = borrows.reduce((sum, b) => {
      const value = b.amount * b.token.price;
      return sum + (value * b.apy / 100);
    }, 0);
    
    return {
      daily: yearlyInterest / 365,
      monthly: yearlyInterest / 12,
      yearly: yearlyInterest,
    };
  }, [borrows]);

  /**
   * Calculate collateral ratio
   */
  const collateralRatio = useMemo(() => {
    if (totalBorrowed === 0) return Infinity;
    return (totalSupplied / totalBorrowed) * 100;
  }, [totalSupplied, totalBorrowed]);

  /**
   * Calculate utilization rate
   */
  const utilizationRate = useMemo(() => {
    if (totalSupplied === 0) return 0;
    return (totalBorrowed / totalSupplied) * 100;
  }, [totalSupplied, totalBorrowed]);

  /**
   * Check if health factor is safe
   */
  const isHealthFactorSafe = useMemo(() => {
    return healthFactor >= HEALTH_FACTOR.SAFE;
  }, [healthFactor]);

  /**
   * Get health factor status
   */
  const healthFactorStatus = useMemo(() => {
    return getHealthFactorStatus(healthFactor);
  }, [healthFactor]);

  /**
   * Calculate max borrowable amount for a token
   */
  const getMaxBorrowable = useCallback((token) => {
    // Max borrowable is based on available borrow capacity
    // Convert from ETH value to token amount
    const maxInToken = availableToBorrow / token.price;
    return maxInToken * 0.99; // 99% to account for slippage and safety
  }, [availableToBorrow]);

  /**
   * Calculate new health factor after borrow
   */
  const calculateNewHealthFactor = useCallback((borrowAmount, token) => {
    if (!borrowAmount || parseFloat(borrowAmount) === 0) return healthFactor;
    
    const borrowValue = parseFloat(borrowAmount) * token.price;
    const newTotalBorrowed = totalBorrowed + borrowValue;
    
    if (newTotalBorrowed === 0) return Infinity;
    
    // Simplified calculation - actual calculation would use liquidation threshold
    const newHealthFactor = (totalSupplied * 0.85) / newTotalBorrowed;
    return newHealthFactor;
  }, [healthFactor, totalBorrowed, totalSupplied]);

  /**
   * Get borrow by ID
   */
  const getBorrowById = useCallback((id) => {
    return borrows.find(b => b.id === id);
  }, [borrows]);

  /**
   * Get borrows by token symbol
   */
  const getBorrowsByToken = useCallback((symbol) => {
    return borrows.filter(b => b.token.symbol === symbol);
  }, [borrows]);

  /**
   * Validate borrow amount
   */
  const validateBorrowAmount = useCallback((amount, token) => {
    setError(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (!token) {
      setError('Please select a token');
      return false;
    }

    const amountNum = parseFloat(amount);
    const maxBorrowable = getMaxBorrowable(token);

    if (amountNum > maxBorrowable) {
      setError(`Maximum borrowable amount is ${maxBorrowable.toFixed(4)} ${token.symbol}`);
      return false;
    }

    // Check new health factor
    const newHF = calculateNewHealthFactor(amount, token);
    if (newHF < HEALTH_FACTOR.SAFE) {
      setError(`This borrow would bring your health factor to ${newHF.toFixed(2)}, which is risky`);
      return false;
    }

    return true;
  }, [getMaxBorrowable, calculateNewHealthFactor]);

  /**
   * Borrow tokens
   */
  const borrow = useCallback(async (token, amount) => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return null;
    }

    if (!validateBorrowAmount(amount, token)) {
      return null;
    }

    try {
      setError(null);
      const receipt = await borrowFromPool(token, amount);
      
      // Reset form
      setBorrowAmount('');
      setSelectedToken(null);
      
      return receipt;
    } catch (err) {
      setError(err.message || 'Failed to borrow tokens');
      throw err;
    }
  }, [isConnected, validateBorrowAmount, borrowFromPool]);

  /**
   * Repay borrowed tokens
   */
  const repay = useCallback(async (borrowId, amount = null) => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return null;
    }

    try {
      setError(null);
      const receipt = await repayToPool(borrowId, amount);
      return receipt;
    } catch (err) {
      setError(err.message || 'Failed to repay tokens');
      throw err;
    }
  }, [isConnected, repayToPool]);

  /**
   * Get available tokens for borrow
   */
  const availableTokens = useMemo(() => {
    return SUPPORTED_TOKENS.map(token => ({
      ...token,
      currentBorrow: borrows
        .filter(b => b.token.symbol === token.symbol)
        .reduce((sum, b) => sum + b.amount, 0),
      maxBorrowable: getMaxBorrowable(token),
    }));
  }, [borrows, getMaxBorrowable]);

  /**
   * Get largest borrow by value
   */
  const topBorrow = useMemo(() => {
    if (borrows.length === 0) return null;
    
    return borrows.reduce((max, b) => {
      const value = b.amount * b.token.price;
      const maxValue = max ? max.amount * max.token.price : 0;
      return value > maxValue ? b : max;
    }, null);
  }, [borrows]);

  /**
   * Check if user can borrow
   */
  const canBorrow = useMemo(() => {
    return totalSupplied > 0 && availableToBorrow > 0 && isHealthFactorSafe;
  }, [totalSupplied, availableToBorrow, isHealthFactorSafe]);

  /**
   * Format borrow summary
   */
  const borrowSummary = useMemo(() => {
    return {
      totalBorrowed: formatCurrency(totalBorrowed),
      averageAPY: formatPercent(averageBorrowAPY),
      totalPositions: borrows.length,
      dailyInterest: formatCurrency(estimatedInterest.daily),
      monthlyInterest: formatCurrency(estimatedInterest.monthly),
      yearlyInterest: formatCurrency(estimatedInterest.yearly),
      healthFactor: formatHealthFactor(totalSupplied, totalBorrowed),
      healthFactorStatus,
      collateralRatio: formatPercent(collateralRatio),
      utilizationRate: formatPercent(utilizationRate),
      availableToBorrow: formatCurrency(availableToBorrow),
    };
  }, [
    totalBorrowed, 
    averageBorrowAPY, 
    borrows.length, 
    estimatedInterest,
    totalSupplied,
    healthFactorStatus,
    collateralRatio,
    utilizationRate,
    availableToBorrow
  ]);

  return {
    // State
    borrows,
    totalBorrowed,
    healthFactor,
    availableToBorrow,
    selectedToken,
    borrowAmount,
    isLoading,
    error: error || contractError,
    
    // Computed
    averageBorrowAPY,
    estimatedInterest,
    collateralRatio,
    utilizationRate,
    isHealthFactorSafe,
    healthFactorStatus,
    availableTokens,
    topBorrow,
    canBorrow,
    borrowSummary,
    
    // Setters
    setSelectedToken,
    setBorrowAmount,
    setError,
    
    // Methods
    borrow,
    repay,
    getBorrowById,
    getBorrowsByToken,
    validateBorrowAmount,
    getMaxBorrowable,
    calculateNewHealthFactor,
  };
};

export default useBorrow;