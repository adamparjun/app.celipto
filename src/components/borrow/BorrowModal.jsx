import React, { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingDown, Shield, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useBorrow } from '@/hooks/useBorrow';
import { formatCurrency, formatPercent, validateAmountInput, getHealthFactorStatus } from '@/utils/formatters';
import { ButtonLoading } from '@/components/common/Loading';

const BorrowModal = ({ token, maxBorrowable, availableToBorrow, onClose, onSuccess }) => {
  const { isConnected } = useWallet();
  const { 
    borrow, 
    isLoading, 
    error: borrowError,
    healthFactor,
    calculateNewHealthFactor 
  } = useBorrow();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Processing
  const [newHealthFactor, setNewHealthFactor] = useState(healthFactor);

  // Calculate values
  const amountValue = parseFloat(amount) || 0;
  const usdValue = amountValue * token.price;
  const estimatedDailyInterest = (usdValue * token.borrowAPY) / (100 * 365);
  const estimatedYearlyInterest = (usdValue * token.borrowAPY) / 100;

  // Validate amount and calculate new health factor
  useEffect(() => {
    if (!amount) {
      setError('');
      setNewHealthFactor(healthFactor);
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      setNewHealthFactor(healthFactor);
      return;
    }

    if (numAmount > maxBorrowable) {
      setError(`Maximum borrowable amount is ${maxBorrowable.toFixed(4)} ${token.symbol}`);
      setNewHealthFactor(healthFactor);
      return;
    }

    // Calculate new health factor
    const newHF = calculateNewHealthFactor(amount, token);
    setNewHealthFactor(newHF);

    if (newHF < 1.2) {
      setError('This borrow would put you at high risk of liquidation');
      return;
    }

    if (newHF < 1.5) {
      setError('Warning: Health factor will be low. Consider borrowing less.');
      return;
    }

    setError('');
  }, [amount, maxBorrowable, token, healthFactor, calculateNewHealthFactor]);

  // Handle amount input
  const handleAmountChange = (e) => {
    const value = validateAmountInput(e.target.value, token.decimals);
    setAmount(value);
  };

  // Set max amount (80% of available to be safe)
  const handleMaxClick = () => {
    const safeMax = maxBorrowable * 0.8;
    setAmount(safeMax.toFixed(token.decimals));
  };

  // Handle borrow
  const handleBorrow = async () => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (error || !amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setStep(3); // Processing
      await borrow(token, amount);
      
      // Success
      if (onSuccess) {
        onSuccess(amount);
      }
    } catch (err) {
      setError(err.message || 'Failed to borrow tokens');
      setStep(1); // Back to input
    }
  };

  const currentHealthFactorStatus = getHealthFactorStatus(healthFactor);
  const newHealthFactorStatus = getHealthFactorStatus(newHealthFactor);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center font-bold text-white">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Borrow {token.symbol}</h3>
              <p className="text-sm text-gray-400">Get instant liquidity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <>
              {/* Current Health Factor */}
              <div className={`bg-${currentHealthFactorStatus.color}-900 bg-opacity-20 border border-${currentHealthFactorStatus.color}-700 rounded-lg p-4 mb-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield size={20} className={`text-${currentHealthFactorStatus.color}-400`} />
                    <div>
                      <div className="text-sm text-gray-300">Current Health Factor</div>
                      <div className={`text-2xl font-bold text-${currentHealthFactorStatus.color}-400`}>
                        {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 bg-${currentHealthFactorStatus.color}-900 rounded-full text-${currentHealthFactorStatus.color}-200 text-sm`}>
                    {currentHealthFactorStatus.text}
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Borrow Amount</label>
                  <div className="text-sm text-gray-400">
                    Available: {formatCurrency(availableToBorrow)}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    className={`w-full bg-gray-900 border ${
                      error ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg px-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-purple-500 transition`}
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                  >
                    SAFE MAX
                  </button>
                </div>
                {amount && !error && (
                  <div className="text-sm text-gray-400 mt-2">
                    ≈ {formatCurrency(usdValue)}
                  </div>
                )}
                {error && (
                  <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* New Health Factor Prediction */}
              {amount && (
                <div className={`bg-${newHealthFactorStatus.color}-900 bg-opacity-20 border border-${newHealthFactorStatus.color}-700 rounded-lg p-4 mb-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">New Health Factor</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold text-${newHealthFactorStatus.color}-400`}>
                        {newHealthFactor === Infinity ? '∞' : newHealthFactor.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({newHealthFactor < healthFactor ? '↓' : '↑'} {Math.abs(healthFactor - newHealthFactor).toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {newHealthFactor < 1.5 && (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <AlertTriangle size={14} />
                        <span>Consider reducing borrow amount to maintain safer health factor</span>
                      </div>
                    )}
                    {newHealthFactor >= 1.5 && (
                      <span className="text-green-400">✓ Health factor remains safe</span>
                    )}
                  </div>
                </div>
              )}

              {/* Borrow APY */}
              <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-300">Borrow APY</span>
                  <span className="text-2xl font-bold text-red-400">
                    {formatPercent(token.borrowAPY)}
                  </span>
                </div>
                <div className="text-xs text-red-300">
                  Variable rate - you'll pay interest on borrowed amount
                </div>
              </div>

              {/* Interest Cost Estimate */}
              {amount && !error && (
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-400 mb-3 flex items-center space-x-2">
                    <TrendingDown size={16} />
                    <span>Estimated Interest Cost</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Daily</div>
                      <div className="text-lg font-semibold text-red-400">
                        -{formatCurrency(estimatedDailyInterest)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Yearly</div>
                      <div className="text-lg font-semibold text-red-400">
                        -{formatCurrency(estimatedYearlyInterest)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Borrow Details */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max LTV</span>
                  <span className="text-white font-medium">
                    {formatPercent(token.ltv * 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Liquidation Threshold</span>
                  <span className="text-white font-medium">
                    {formatPercent(token.liquidationThreshold * 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Liquidation Penalty</span>
                  <span className="text-red-400 font-medium">
                    {formatPercent(token.liquidationBonus * 100)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!amount || error || parseFloat(amount) <= 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Confirmation */}
              <div className="space-y-4 mb-6">
                <div className="bg-purple-900 bg-opacity-20 border border-purple-700 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-purple-300 mb-2">You are borrowing</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {parseFloat(amount).toFixed(4)} {token.symbol}
                    </div>
                    <div className="text-sm text-purple-300">
                      ≈ {formatCurrency(usdValue)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Borrow APY</span>
                    <span className="text-red-400 font-semibold">
                      {formatPercent(token.borrowAPY)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Interest</span>
                    <span className="text-white font-semibold">
                      -{formatCurrency(estimatedDailyInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Health Factor</span>
                    <span className={`font-semibold text-${newHealthFactorStatus.color}-400`}>
                      {newHealthFactor === Infinity ? '∞' : newHealthFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-200">
                    <div className="font-medium mb-1">Liquidation Risk</div>
                    <div>
                      If your health factor drops below 1.0, your collateral may be liquidated. 
                      Monitor your position regularly and maintain a safe health factor.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={handleBorrow}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-semibold transition"
                >
                  {isLoading ? <ButtonLoading text="Borrowing..." /> : 'Confirm Borrow'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <TrendingDown size={40} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Processing Transaction</h4>
              <p className="text-gray-400 mb-4">
                Please confirm the transaction in your wallet
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Error Display */}
          {borrowError && (
            <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <div className="text-sm text-red-200">{borrowError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowModal;