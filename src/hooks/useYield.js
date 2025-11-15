import { useState, useMemo, useCallback, useEffect } from 'react';
import { useContract } from './useContract';
import { useWallet } from './useWallet';
import { SUPPORTED_TOKENS } from '@/utils/constants';
import { formatCurrency, formatPercent } from '@/utils/formatters';

/**
 * Custom hook for yield farming and earnings tracking
 */
export const useYield = () => {
  const { supplies, totalSupplied, isLoading } = useContract();
  const { isConnected } = useWallet();
  
  const [yieldHistory, setYieldHistory] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d'); // 7d, 30d, 90d, 1y

  /**
   * Calculate total yield earned (simulated)
   */
  const totalYieldEarned = useMemo(() => {
    // In production, this would fetch actual earned yield from contracts
    // For now, we simulate based on supplies and APY
    return supplies.reduce((total, supply) => {
      const daysSupplied = Math.floor(
        (Date.now() - new Date(supply.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      const dailyYield = (supply.amount * supply.token.price * supply.apy) / (100 * 365);
      return total + (dailyYield * daysSupplied);
    }, 0);
  }, [supplies]);

  /**
   * Calculate estimated daily yield
   */
  const estimatedDailyYield = useMemo(() => {
    return supplies.reduce((total, supply) => {
      const value = supply.amount * supply.token.price;
      const dailyYield = (value * supply.apy) / (100 * 365);
      return total + dailyYield;
    }, 0);
  }, [supplies]);

  /**
   * Calculate estimated monthly yield
   */
  const estimatedMonthlyYield = useMemo(() => {
    return estimatedDailyYield * 30;
  }, [estimatedDailyYield]);

  /**
   * Calculate estimated yearly yield
   */
  const estimatedYearlyYield = useMemo(() => {
    return estimatedDailyYield * 365;
  }, [estimatedDailyYield]);

  /**
   * Calculate weighted average APY
   */
  const averageAPY = useMemo(() => {
    if (supplies.length === 0 || totalSupplied === 0) return 0;
    
    return supplies.reduce((weightedSum, supply) => {
      const value = supply.amount * supply.token.price;
      const weight = value / totalSupplied;
      return weightedSum + (supply.apy * weight);
    }, 0);
  }, [supplies, totalSupplied]);

  /**
   * Get yield breakdown by token
   */
  const yieldBreakdown = useMemo(() => {
    return supplies.map(supply => {
      const value = supply.amount * supply.token.price;
      const dailyYield = (value * supply.apy) / (100 * 365);
      const monthlyYield = dailyYield * 30;
      const yearlyYield = dailyYield * 365;
      
      return {
        token: supply.token,
        suppliedAmount: supply.amount,
        suppliedValue: value,
        apy: supply.apy,
        dailyYield,
        monthlyYield,
        yearlyYield,
        percentage: totalSupplied > 0 ? (value / totalSupplied) * 100 : 0,
      };
    });
  }, [supplies, totalSupplied]);

  /**
   * Get best yielding token
   */
  const bestYieldingToken = useMemo(() => {
    if (yieldBreakdown.length === 0) return null;
    
    return yieldBreakdown.reduce((best, current) => {
      return current.apy > (best?.apy || 0) ? current : best;
    }, null);
  }, [yieldBreakdown]);

  /**
   * Get highest earning position
   */
  const highestEarningPosition = useMemo(() => {
    if (yieldBreakdown.length === 0) return null;
    
    return yieldBreakdown.reduce((highest, current) => {
      return current.yearlyYield > (highest?.yearlyYield || 0) ? current : highest;
    }, null);
  }, [yieldBreakdown]);

  /**
   * Generate yield history data (simulated)
   */
  const generateYieldHistory = useCallback(() => {
    const periods = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    
    const days = periods[selectedPeriod] || 30;
    const history = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate yield growth
      const baseYield = estimatedDailyYield * (days - i);
      const variance = Math.random() * 0.1 - 0.05; // ±5% variance
      const yieldValue = baseYield * (1 + variance);
      
      history.push({
        date: date.toISOString().split('T')[0],
        yield: yieldValue,
        apy: averageAPY * (1 + variance * 0.5), // APY fluctuation
      });
    }
    
    setYieldHistory(history);
  }, [selectedPeriod, estimatedDailyYield, averageAPY]);

  /**
   * Generate history when period changes
   */
  useEffect(() => {
    if (supplies.length > 0) {
      generateYieldHistory();
    }
  }, [selectedPeriod, supplies.length, generateYieldHistory]);

  /**
   * Calculate yield projection
   */
  const yieldProjection = useMemo(() => {
    return {
      oneDay: estimatedDailyYield,
      oneWeek: estimatedDailyYield * 7,
      oneMonth: estimatedMonthlyYield,
      threeMonths: estimatedMonthlyYield * 3,
      sixMonths: estimatedMonthlyYield * 6,
      oneYear: estimatedYearlyYield,
    };
  }, [estimatedDailyYield, estimatedMonthlyYield, estimatedYearlyYield]);

  /**
   * Get top yielding opportunities
   */
  const topYieldOpportunities = useMemo(() => {
    return SUPPORTED_TOKENS
      .map(token => ({
        ...token,
        estimatedDailyYield: (10000 * token.supplyAPY) / (100 * 365), // Based on $10k investment
        estimatedYearlyYield: (10000 * token.supplyAPY) / 100,
      }))
      .sort((a, b) => b.supplyAPY - a.supplyAPY)
      .slice(0, 3);
  }, []);

  /**
   * Calculate yield comparison vs holding
   */
  const yieldVsHolding = useMemo(() => {
    if (totalSupplied === 0) return 0;
    
    // Compare yield earned vs just holding the assets
    const yieldPercentage = (totalYieldEarned / totalSupplied) * 100;
    return yieldPercentage;
  }, [totalYieldEarned, totalSupplied]);

  /**
   * Format yield summary
   */
  const yieldSummary = useMemo(() => {
    return {
      totalYieldEarned: formatCurrency(totalYieldEarned),
      estimatedDailyYield: formatCurrency(estimatedDailyYield),
      estimatedMonthlyYield: formatCurrency(estimatedMonthlyYield),
      estimatedYearlyYield: formatCurrency(estimatedYearlyYield),
      averageAPY: formatPercent(averageAPY),
      totalSupplied: formatCurrency(totalSupplied),
      yieldVsHolding: formatPercent(yieldVsHolding),
      activePositions: supplies.length,
    };
  }, [
    totalYieldEarned,
    estimatedDailyYield,
    estimatedMonthlyYield,
    estimatedYearlyYield,
    averageAPY,
    totalSupplied,
    yieldVsHolding,
    supplies.length
  ]);

  /**
   * Calculate compound interest projection
   */
  const calculateCompoundProjection = useCallback((principal, apy, years) => {
    // Compound interest formula: A = P(1 + r/n)^(nt)
    // Assuming daily compounding (n = 365)
    const rate = apy / 100;
    const amount = principal * Math.pow(1 + rate / 365, 365 * years);
    const interest = amount - principal;
    
    return {
      finalAmount: amount,
      totalInterest: interest,
      percentageGain: (interest / principal) * 100,
    };
  }, []);

  /**
   * Get compound projections for different periods
   */
  const compoundProjections = useMemo(() => {
    if (totalSupplied === 0 || averageAPY === 0) return [];
    
    return [
      { period: '1 Year', years: 1 },
      { period: '3 Years', years: 3 },
      { period: '5 Years', years: 5 },
      { period: '10 Years', years: 10 },
    ].map(({ period, years }) => {
      const projection = calculateCompoundProjection(totalSupplied, averageAPY, years);
      return {
        period,
        ...projection,
      };
    });
  }, [totalSupplied, averageAPY, calculateCompoundProjection]);

  return {
    // State
    yieldHistory,
    selectedPeriod,
    isLoading,
    
    // Computed values
    totalYieldEarned,
    estimatedDailyYield,
    estimatedMonthlyYield,
    estimatedYearlyYield,
    averageAPY,
    yieldBreakdown,
    bestYieldingToken,
    highestEarningPosition,
    yieldProjection,
    topYieldOpportunities,
    yieldVsHolding,
    yieldSummary,
    compoundProjections,
    
    // Setters
    setSelectedPeriod,
    
    // Methods
    generateYieldHistory,
    calculateCompoundProjection,
  };
};

export default useYield;