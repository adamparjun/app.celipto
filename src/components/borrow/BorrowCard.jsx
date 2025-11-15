import React, { useState } from 'react';
import { TrendingDown, Info, AlertTriangle, Zap } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import BorrowModal from './BorrowModal';

const BorrowCard = ({ token, onBorrow, userBorrowed = 0, availableToBorrow = 0 }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBorrowClick = () => {
    setShowModal(true);
  };

  const handleBorrowSuccess = async (amount) => {
    if (onBorrow) {
      await onBorrow(token, amount);
    }
    setShowModal(false);
  };

  // Calculate max borrowable based on available liquidity
  const maxBorrowable = Math.min(
    availableToBorrow / token.price,
    1000000 // Mock available liquidity
  );

  // Calculate interest costs
  const estimatedDailyInterest = userBorrowed > 0 
    ? (userBorrowed * token.borrowAPY) / (100 * 365)
    : 0;

  // Calculate utilization (mock)
  const utilization = 65.4; // Mock utilization rate

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Token Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                {token.symbol.charAt(0)}
              </div>
              {token.isStablecoin && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap size={12} className="text-white" />
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
            <div className="flex items-center space-x-1 text-2xl font-bold text-red-400">
              <span>{formatPercent(token.borrowAPY)}</span>
              <div className="relative">
                <Info 
                  size={16} 
                  className="text-gray-400 cursor-help"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 z-10 shadow-xl">
                    Variable Borrow Rate - Interest you pay on borrowed assets
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <TrendingDown size={12} />
              <span>Borrow APY</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Available to Borrow */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Available</div>
            <div className="text-base font-bold text-white">
              {formatCurrency(maxBorrowable * token.price)}
            </div>
          </div>

          {/* Utilization */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Utilization</div>
            <div className={`text-base font-bold ${
              utilization > 80 ? 'text-red-400' : 
              utilization > 60 ? 'text-yellow-400' : 
              'text-green-400'
            }`}>
              {formatPercent(utilization)}
            </div>
          </div>
        </div>

        {/* User Borrow Position */}
        {userBorrowed > 0 && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-red-300 mb-1">Your Borrow</div>
                <div className="text-lg font-bold text-red-400">
                  {userBorrowed.toFixed(4)} {token.symbol}
                </div>
                <div className="text-xs text-red-300">
                  ≈ {formatCurrency(userBorrowed * token.price)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-red-300 mb-1">Daily Interest</div>
                <div className="text-sm font-semibold text-red-400">
                  -{formatCurrency(estimatedDailyInterest)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interest Costs Preview */}
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-400 mb-2">
            Interest on {formatCurrency(1000)} borrowed
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-500">Daily</div>
              <div className="text-sm font-semibold text-red-400">
                -{formatCurrency((1000 * token.borrowAPY) / (100 * 365))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Monthly</div>
              <div className="text-sm font-semibold text-red-400">
                -{formatCurrency((1000 * token.borrowAPY) / (100 * 12))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Yearly</div>
              <div className="text-sm font-semibold text-red-400">
                -{formatCurrency((1000 * token.borrowAPY) / 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Warning - Need Collateral */}
        {availableToBorrow === 0 && (
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-200">
              You need to supply collateral before borrowing
            </div>
          </div>
        )}

        {/* Borrow Button */}
        <button
          onClick={handleBorrowClick}
          disabled={availableToBorrow === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all transform group-hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg"
        >
          <TrendingDown size={18} />
          <span>Borrow {token.symbol}</span>
        </button>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <span>Loan-to-Value:</span>
              <span className="text-white font-medium">
                {formatPercent(token.ltv * 100)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Variable Rate</span>
              <Info size={12} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Modal */}
      {showModal && (
        <BorrowModal
          token={token}
          maxBorrowable={maxBorrowable}
          availableToBorrow={availableToBorrow}
          onClose={() => setShowModal(false)}
          onSuccess={handleBorrowSuccess}
        />
      )}
    </>
  );
};

export default BorrowCard;