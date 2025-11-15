import React, { useState } from 'react';
import { TrendingUp, Sparkles, Info, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';

const YieldCard = ({ token, userSupplied = 0 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');

  // Calculate earnings based on user supplied amount
  const value = userSupplied * token.price;
  const dailyYield = (value * token.supplyAPY) / (100 * 365);
  const monthlyYield = dailyYield * 30;
  const yearlyYield = (value * token.supplyAPY) / 100;

  // Calculate compound interest projections
  const compoundYield = (principal, apy, years) => {
    const rate = apy / 100;
    return principal * Math.pow(1 + rate / 365, 365 * years) - principal;
  };

  const oneYearCompound = compoundYield(value, token.supplyAPY, 1);
  const threeYearCompound = compoundYield(value, token.supplyAPY, 3);
  const fiveYearCompound = compoundYield(value, token.supplyAPY, 5);

  const periods = {
    daily: { label: 'Daily', value: dailyYield, icon: Calendar },
    monthly: { label: 'Monthly', value: monthlyYield, icon: Calendar },
    yearly: { label: 'Yearly', value: yearlyYield, icon: Calendar },
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Token Icon */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
              {token.symbol.charAt(0)}
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>

          {/* Token Info */}
          <div>
            <h3 className="font-bold text-white text-lg">{token.symbol}</h3>
            <p className="text-sm text-gray-400">{token.name}</p>
          </div>
        </div>

        {/* APY Badge */}
        <div className="text-right">
          <div className="flex items-center space-x-1 text-2xl font-bold text-green-400">
            <span>{formatPercent(token.supplyAPY)}</span>
            <div className="relative">
              <Info 
                size={16} 
                className="text-gray-400 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 z-10 shadow-xl">
                  Annual Percentage Yield - Includes compound interest
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 flex items-center space-x-1">
            <TrendingUp size={12} />
            <span>APY</span>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      {userSupplied > 0 && (
        <div className="mb-4">
          <div className="flex bg-gray-900 rounded-lg p-1 gap-1">
            {Object.entries(periods).map(([key, period]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPeriod === key
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Earnings Display */}
      {userSupplied > 0 ? (
        <div className="bg-gradient-to-br from-green-900 to-emerald-900 bg-opacity-30 border border-green-700 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-green-300 mb-2">
              Your {periods[selectedPeriod].label} Earnings
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              +{formatCurrency(periods[selectedPeriod].value)}
            </div>
            <div className="text-xs text-green-300">
              From {userSupplied.toFixed(4)} {token.symbol} supplied
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">
              Potential Earnings on $1,000
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              +{formatCurrency((1000 * token.supplyAPY) / 100)}
            </div>
            <div className="text-xs text-gray-400">per year</div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Daily Rate</div>
          <div className="text-sm font-semibold text-green-400">
            +{formatPercent(token.supplyAPY / 365)}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Compounding</div>
          <div className="text-sm font-semibold text-white">Every Block</div>
        </div>
      </div>

      {/* Compound Interest Preview */}
      {userSupplied > 0 && (
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
            <Sparkles size={16} className="text-yellow-400" />
            <span>Compound Interest Projection</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">1 Year</span>
              <span className="text-green-400 font-semibold">
                +{formatCurrency(oneYearCompound)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">3 Years</span>
              <span className="text-green-400 font-semibold">
                +{formatCurrency(threeYearCompound)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">5 Years</span>
              <span className="text-green-400 font-semibold">
                +{formatCurrency(fiveYearCompound)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Token Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Current Price</div>
          <div className="text-sm font-bold text-white">
            {formatCurrency(token.price)}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Type</div>
          <div className="text-sm font-semibold text-white">
            {token.isStablecoin ? 'Stablecoin' : 'Volatile'}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {userSupplied > 0 ? (
        <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">Actively Earning</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => window.location.href = '/supply'}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 rounded-lg font-semibold transition-all transform group-hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg"
        >
          <DollarSign size={18} />
          <span>Start Earning</span>
        </button>
      )}

      {/* Risk Info */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <span>Risk Level:</span>
            <span className={`font-medium ${
              token.isStablecoin ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {token.isStablecoin ? 'Low' : 'Medium'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Auto-compound</span>
            <span className="text-green-400">✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldCard;