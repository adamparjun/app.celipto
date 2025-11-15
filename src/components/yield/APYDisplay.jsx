import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, Zap, Target, Calculator } from 'lucide-react';
import { formatPercent, formatCurrency } from '@/utils/formatters';

const APYDisplay = ({ 
  supplyAPY, 
  borrowAPY, 
  netAPY, 
  userSupplied = 0, 
  userBorrowed = 0,
  showCalculator = true 
}) => {
  const [calculatorAmount, setCalculatorAmount] = useState('1000');
  const [calculatorPeriod, setCalculatorPeriod] = useState('1'); // years

  // Calculate net APY if not provided
  const calculatedNetAPY = netAPY !== undefined 
    ? netAPY 
    : supplyAPY - (borrowAPY || 0);

  // Calculate user's actual earnings/costs
  const userSupplyValue = userSupplied;
  const userBorrowValue = userBorrowed;
  
  const annualSupplyEarnings = (userSupplyValue * supplyAPY) / 100;
  const annualBorrowCost = (userBorrowValue * (borrowAPY || 0)) / 100;
  const netAnnualYield = annualSupplyEarnings - annualBorrowCost;

  // Calculator
  const calculateProjection = () => {
    const principal = parseFloat(calculatorAmount) || 0;
    const years = parseFloat(calculatorPeriod) || 1;
    const rate = supplyAPY / 100;
    
    // Simple interest
    const simpleInterest = principal * rate * years;
    
    // Compound interest (daily compounding)
    const compoundInterest = principal * Math.pow(1 + rate / 365, 365 * years) - principal;
    
    return {
      principal,
      simpleInterest,
      compoundInterest,
      finalAmount: principal + compoundInterest,
    };
  };

  const projection = calculateProjection();

  return (
    <div className="space-y-6">
      {/* Main APY Display */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white mb-1">APY Overview</h3>
          <p className="text-sm text-gray-400">Current annual percentage yields</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supply APY */}
            <div className="bg-gradient-to-br from-green-900 to-emerald-900 bg-opacity-30 border border-green-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div className="bg-green-900 bg-opacity-50 px-3 py-1 rounded-full">
                  <span className="text-xs text-green-300 font-medium">Earning</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-sm text-green-300 mb-1">Supply APY</div>
                <div className="text-4xl font-bold text-green-400">
                  {formatPercent(supplyAPY)}
                </div>
              </div>
              {userSupplied > 0 && (
                <div className="pt-3 border-t border-green-700">
                  <div className="text-xs text-green-300 mb-1">Your annual earnings</div>
                  <div className="text-lg font-semibold text-white">
                    +{formatCurrency(annualSupplyEarnings)}
                  </div>
                </div>
              )}
            </div>

            {/* Borrow APY */}
            {borrowAPY !== undefined && (
              <div className="bg-gradient-to-br from-red-900 to-pink-900 bg-opacity-30 border border-red-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <TrendingDown size={24} className="text-white" />
                  </div>
                  <div className="bg-red-900 bg-opacity-50 px-3 py-1 rounded-full">
                    <span className="text-xs text-red-300 font-medium">Paying</span>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-sm text-red-300 mb-1">Borrow APY</div>
                  <div className="text-4xl font-bold text-red-400">
                    {formatPercent(borrowAPY)}
                  </div>
                </div>
                {userBorrowed > 0 && (
                  <div className="pt-3 border-t border-red-700">
                    <div className="text-xs text-red-300 mb-1">Your annual cost</div>
                    <div className="text-lg font-semibold text-white">
                      -{formatCurrency(annualBorrowCost)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Net APY */}
            <div className={`bg-gradient-to-br ${
              calculatedNetAPY >= 0 
                ? 'from-blue-900 to-indigo-900' 
                : 'from-orange-900 to-red-900'
            } bg-opacity-30 border ${
              calculatedNetAPY >= 0 ? 'border-blue-700' : 'border-orange-700'
            } rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${
                  calculatedNetAPY >= 0 ? 'bg-blue-600' : 'bg-orange-600'
                } rounded-full flex items-center justify-center`}>
                  <Target size={24} className="text-white" />
                </div>
                <div className={`${
                  calculatedNetAPY >= 0 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-orange-900 text-orange-300'
                } bg-opacity-50 px-3 py-1 rounded-full`}>
                  <span className="text-xs font-medium">
                    {calculatedNetAPY >= 0 ? 'Profit' : 'Cost'}
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className={`text-sm ${
                  calculatedNetAPY >= 0 ? 'text-blue-300' : 'text-orange-300'
                } mb-1`}>
                  Net APY
                </div>
                <div className={`text-4xl font-bold ${
                  calculatedNetAPY >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {calculatedNetAPY >= 0 ? '+' : ''}{formatPercent(calculatedNetAPY)}
                </div>
              </div>
              {(userSupplied > 0 || userBorrowed > 0) && (
                <div className={`pt-3 border-t ${
                  calculatedNetAPY >= 0 ? 'border-blue-700' : 'border-orange-700'
                }`}>
                  <div className={`text-xs ${
                    calculatedNetAPY >= 0 ? 'text-blue-300' : 'text-orange-300'
                  } mb-1`}>
                    Your net annual yield
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {netAnnualYield >= 0 ? '+' : ''}{formatCurrency(netAnnualYield)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* APY Explanation */}
          <div className="mt-6 bg-gray-900 rounded-lg p-4 flex items-start space-x-3">
            <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <div className="font-medium text-white mb-1">How APY Works</div>
              <div>
                APY (Annual Percentage Yield) shows your yearly returns with compound interest. 
                Interest is automatically reinvested and compounds every block (~12 seconds), 
                maximizing your earnings over time.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APY Calculator */}
      {showCalculator && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Calculator size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Yield Calculator</h3>
                <p className="text-sm text-gray-400">Calculate potential earnings</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Time Period (Years)</label>
                <input
                  type="number"
                  value={calculatorPeriod}
                  onChange={(e) => setCalculatorPeriod(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="1"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 bg-opacity-30 border border-purple-700 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 text-purple-300 text-sm mb-3">
                    <Zap size={16} />
                    <span>With Compound Interest</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Total Interest Earned</div>
                      <div className="text-2xl font-bold text-green-400">
                        +{formatCurrency(projection.compoundInterest)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Final Amount</div>
                      <div className="text-xl font-semibold text-white">
                        {formatCurrency(projection.finalAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-3">
                    <Info size={16} />
                    <span>Simple Interest (No Compound)</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Total Interest Earned</div>
                      <div className="text-2xl font-bold text-gray-300">
                        +{formatCurrency(projection.simpleInterest)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Compound Advantage</div>
                      <div className="text-xl font-semibold text-purple-400">
                        +{formatCurrency(projection.compoundInterest - projection.simpleInterest)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-purple-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Current APY Rate</span>
                  <span className="text-purple-400 font-semibold text-lg">
                    {formatPercent(supplyAPY)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              * Calculations assume constant APY rate. Actual rates may vary based on market conditions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APYDisplay;