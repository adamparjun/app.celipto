import React, { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingUp, DollarSign, Info } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useSupply } from '@/hooks/useSupply';
import { formatCurrency, formatPercent, validateAmountInput } from '@/utils/formatters';
import { ButtonLoading } from '@/components/common/Loading';

const SupplyModal = ({ token, onClose, onSuccess }) => {
  const { account, balance, isConnected } = useWallet();
  const { supply, isLoading, error: supplyError } = useSupply();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Processing

  // Get available balance (mock - should fetch actual token balance)
  const availableBalance = token.isNative ? parseFloat(balance) : 0;

  // Calculate values
  const amountValue = parseFloat(amount) || 0;
  const usdValue = amountValue * token.price;
  const estimatedDailyEarnings = (usdValue * token.supplyAPY) / (100 * 365);
  const estimatedYearlyEarnings = (usdValue * token.supplyAPY) / 100;

  // Validate amount
  useEffect(() => {
    if (!amount) {
      setError('');
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Insufficient balance. You have ${availableBalance.toFixed(4)} ${token.symbol}`);
      return;
    }

    setError('');
  }, [amount, availableBalance, token.symbol]);

  // Handle amount input
  const handleAmountChange = (e) => {
    const value = validateAmountInput(e.target.value, token.decimals);
    setAmount(value);
  };

  // Set max amount
  const handleMaxClick = () => {
    // Leave some ETH for gas if it's native token
    const maxAmount = token.isNative 
      ? Math.max(0, availableBalance - 0.01) 
      : availableBalance;
    setAmount(maxAmount.toFixed(token.decimals));
  };

  // Handle supply
  const handleSupply = async () => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (error || !amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setStep(3); // Processing
      await supply(token, amount);
      
      // Success
      if (onSuccess) {
        onSuccess(amount);
      }
    } catch (err) {
      setError(err.message || 'Failed to supply tokens');
      setStep(1); // Back to input
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Supply {token.symbol}</h3>
              <p className="text-sm text-gray-400">Deposit and start earning</p>
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
              {/* Amount Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Amount</label>
                  <div className="text-sm text-gray-400">
                    Available: {availableBalance.toFixed(4)} {token.symbol}
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
                    } rounded-lg px-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-blue-500 transition`}
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                  >
                    MAX
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

              {/* APY Info */}
              <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-300">Supply APY</span>
                  <span className="text-2xl font-bold text-green-400">
                    {formatPercent(token.supplyAPY)}
                  </span>
                </div>
                <div className="text-xs text-green-300">
                  Variable rate - updates based on market conditions
                </div>
              </div>

              {/* Estimated Earnings */}
              {amount && !error && (
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-400 mb-3 flex items-center space-x-2">
                    <TrendingUp size={16} />
                    <span>Estimated Earnings</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Daily</div>
                      <div className="text-lg font-semibold text-green-400">
                        {formatCurrency(estimatedDailyEarnings)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Yearly</div>
                      <div className="text-lg font-semibold text-green-400">
                        {formatCurrency(estimatedYearlyEarnings)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Collateral Factor</span>
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
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">Can be used as collateral</span>
                    <Info size={14} className="text-gray-500" />
                  </div>
                  <span className="text-green-400 font-medium">Yes</span>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
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
                <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-blue-300 mb-2">You are supplying</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {parseFloat(amount).toFixed(4)} {token.symbol}
                    </div>
                    <div className="text-sm text-blue-300">
                      ≈ {formatCurrency(usdValue)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supply APY</span>
                    <span className="text-green-400 font-semibold">
                      {formatPercent(token.supplyAPY)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Earnings</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(estimatedDailyEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Yearly Earnings</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(estimatedYearlyEarnings)}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-200">
                    <div className="font-medium mb-1">Important</div>
                    <div>
                      Your supplied assets will be used as collateral and can be borrowed by others. 
                      You will earn interest on your deposit.
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
                  onClick={handleSupply}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 rounded-lg font-semibold transition"
                >
                  {isLoading ? <ButtonLoading text="Supplying..." /> : 'Confirm Supply'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <TrendingUp size={40} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Processing Transaction</h4>
              <p className="text-gray-400 mb-4">
                Please confirm the transaction in your wallet
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Error Display */}
          {supplyError && (
            <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <div className="text-sm text-red-200">{supplyError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyModal;