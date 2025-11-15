import React, { useState } from 'react';
import { TrendingUp, Info, DollarSign, Percent } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import SupplyModal from './SupplyModal';

const SupplyCard = ({ token, onSupply, userBalance = 0 }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSupplyClick = () => {
    setShowModal(true);
  };

  const handleSupplySuccess = async (amount) => {
    if (onSupply) {
      await onSupply(token, amount);
    }
    setShowModal(false);
  };

  // Calculate estimated earnings
  const estimatedDailyEarnings = userBalance > 0 
    ? (userBalance * token.supplyAPY) / (100 * 365)
    : 0;

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Token Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                {token.symbol.charAt(0)}
              </div>
              {token.isStablecoin && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <DollarSign size={12} className="text-white" />
                </div>
              )}
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
                    Annual Percentage Yield (APY) - Variable rate based on market conditions
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <Percent size={12} />
              <span>Supply APY</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Current Price */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Current Price</div>
            <div className="text-base font-bold text-white">
              {formatCurrency(token.price)}
            </div>
          </div>

          {/* LTV */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Max LTV</div>
            <div className="text-base font-bold text-white">
              {formatPercent(token.ltv * 100)}
            </div>
          </div>
        </div>

        {/* User Balance */}
        {userBalance > 0 && (
          <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-300 mb-1">Your Supply</div>
                <div className="text-lg font-bold text-blue-400">
                  {userBalance.toFixed(4)} {token.symbol}
                </div>
                <div className="text-xs text-blue-300">
                  ≈ {formatCurrency(userBalance * token.price)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-300 mb-1">Daily Earnings</div>
                <div className="text-sm font-semibold text-green-400">
                  +{formatCurrency(estimatedDailyEarnings)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Estimate */}
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-400 mb-2">Estimated Earnings on $1,000</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-500">Daily</div>
              <div className="text-sm font-semibold text-green-400">
                {formatCurrency((1000 * token.supplyAPY) / (100 * 365))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Monthly</div>
              <div className="text-sm font-semibold text-green-400">
                {formatCurrency((1000 * token.supplyAPY) / (100 * 12))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Yearly</div>
              <div className="text-sm font-semibold text-green-400">
                {formatCurrency((1000 * token.supplyAPY) / 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Supply Button */}
        <button
          onClick={handleSupplyClick}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all transform group-hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg"
        >
          <TrendingUp size={18} />
          <span>Supply {token.symbol}</span>
        </button>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <span>Liquidation Threshold:</span>
              <span className="text-white font-medium">
                {formatPercent(token.liquidationThreshold * 100)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Bonus:</span>
              <span className="text-green-400 font-medium">
                {formatPercent(token.liquidationBonus * 100)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Supply Modal */}
      {showModal && (
        <SupplyModal
          token={token}
          onClose={() => setShowModal(false)}
          onSuccess={handleSupplySuccess}
        />
      )}
    </>
  );
};

export default SupplyCard;