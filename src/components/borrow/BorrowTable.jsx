import React, { useState } from 'react';
import { TrendingDown, CreditCard, ExternalLink, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatPercent, formatRelativeTime } from '@/utils/formatters';
import { useBorrow } from '@/hooks/useBorrow';
import { ButtonLoading } from '@/components/common/Loading';

const BorrowTable = ({ borrows, onRepay }) => {
  const { isLoading, healthFactor, healthFactorStatus } = useBorrow();
  const [repayingId, setRepayingId] = useState(null);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);

  const handleRepayClick = (borrow) => {
    setSelectedBorrow(borrow);
    setShowRepayModal(true);
  };

  const handleRepayConfirm = async () => {
    if (!selectedBorrow) return;

    try {
      setRepayingId(selectedBorrow.id);
      await onRepay(selectedBorrow.id);
      setShowRepayModal(false);
      setSelectedBorrow(null);
    } catch (error) {
      console.error('Repay error:', error);
    } finally {
      setRepayingId(null);
    }
  };

  if (borrows.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingDown size={32} className="text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Active Borrows</h3>
        <p className="text-gray-400 mb-6">
          You haven't borrowed any assets yet
        </p>
        <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start space-x-3 text-sm text-blue-200">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              To borrow, you need to supply collateral first. Head to the Supply page to get started.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total debt
  const totalDebt = borrows.reduce((sum, b) => sum + (b.amount * b.token.price), 0);

  return (
    <>
      <div className="space-y-6">
        {/* Health Factor Warning */}
        <div className={`bg-${healthFactorStatus.color}-900 bg-opacity-20 border border-${healthFactorStatus.color}-700 rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {healthFactorStatus.color === 'red' ? (
                <AlertCircle size={24} className={`text-${healthFactorStatus.color}-400`} />
              ) : (
                <CheckCircle size={24} className={`text-${healthFactorStatus.color}-400`} />
              )}
              <div>
                <div className="text-sm text-gray-300">Health Factor</div>
                <div className={`text-2xl font-bold text-${healthFactorStatus.color}-400`}>
                  {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 bg-${healthFactorStatus.color}-900 rounded-full`}>
              <span className={`text-${healthFactorStatus.color}-200 font-medium`}>
                {healthFactorStatus.emoji} {healthFactorStatus.text}
              </span>
            </div>
          </div>
          {healthFactor < 1.5 && healthFactor !== Infinity && (
            <div className="mt-3 text-sm text-yellow-200 flex items-start space-x-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Your health factor is low. Consider repaying some debt or adding more collateral to avoid liquidation.
              </span>
            </div>
          )}
        </div>

        {/* Borrow Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">Your Borrows</h3>
              <p className="text-sm text-gray-400">
                {borrows.length} active position{borrows.length !== 1 ? 's' : ''} · Total debt: {formatCurrency(totalDebt)}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="bg-red-900 bg-opacity-30 text-red-400 px-3 py-1 rounded-full">
                Accruing Interest
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Borrowed
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Debt (USD)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Borrow APY
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Interest Cost
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {borrows.map((borrow) => {
                  const debt = borrow.amount * borrow.token.price;
                  const dailyInterest = (debt * borrow.apy) / (100 * 365);
                  
                  return (
                    <tr key={borrow.id} className="hover:bg-gray-750 transition">
                      {/* Asset */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center font-bold text-white">
                            {borrow.token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{borrow.token.symbol}</div>
                            <div className="text-sm text-gray-400">{borrow.token.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Borrowed Amount */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-medium text-white">
                          {borrow.amount.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-400">{borrow.token.symbol}</div>
                      </td>

                      {/* Debt */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-semibold text-white">
                          {formatCurrency(debt)}
                        </div>
                      </td>

                      {/* APY */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <TrendingDown size={14} className="text-red-400" />
                          <span className="font-semibold text-red-400">
                            {formatPercent(borrow.apy)}
                          </span>
                        </div>
                      </td>

                      {/* Interest Cost */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-red-400 font-medium">
                          -{formatCurrency(dailyInterest)}
                        </div>
                        <div className="text-xs text-gray-400">per day</div>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1 text-sm text-gray-400">
                          <Clock size={14} />
                          <span>{formatRelativeTime(borrow.timestamp)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {borrow.txHash && (
                            <a
                              href={`https://etherscan.io/tx/${borrow.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-700 rounded-lg transition"
                              title="View on Etherscan"
                            >
                              <ExternalLink size={16} className="text-gray-400 hover:text-white" />
                            </a>
                          )}
                          <button
                            onClick={() => handleRepayClick(borrow)}
                            disabled={repayingId === borrow.id}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1"
                          >
                            {repayingId === borrow.id ? (
                              <ButtonLoading text="" />
                            ) : (
                              <>
                                <CreditCard size={14} />
                                <span>Repay</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-700">
            {borrows.map((borrow) => {
              const debt = borrow.amount * borrow.token.price;
              const dailyInterest = (debt * borrow.apy) / (100 * 365);

              return (
                <div key={borrow.id} className="p-4">
                  {/* Asset Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center font-bold text-white">
                        {borrow.token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{borrow.token.symbol}</div>
                        <div className="text-sm text-gray-400">{borrow.token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-semibold">
                        {formatPercent(borrow.apy)}
                      </div>
                      <div className="text-xs text-gray-400">Borrow APY</div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Borrowed</div>
                      <div className="font-semibold text-white">
                        {borrow.amount.toFixed(4)}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Debt</div>
                      <div className="font-semibold text-white">
                        {formatCurrency(debt)}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Daily Interest</div>
                      <div className="font-semibold text-red-400">
                        -{formatCurrency(dailyInterest)}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Time</div>
                      <div className="text-sm text-white">
                        {formatRelativeTime(borrow.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {borrow.txHash && (
                      <a
                        href={`https://etherscan.io/tx/${borrow.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                      >
                        <ExternalLink size={16} />
                        <span>View Tx</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleRepayClick(borrow)}
                      disabled={repayingId === borrow.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                    >
                      {repayingId === borrow.id ? (
                        <ButtonLoading text="Repaying..." />
                      ) : (
                        <>
                          <CreditCard size={16} />
                          <span>Repay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Repay Confirmation Modal */}
      {showRepayModal && selectedBorrow && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Repayment</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-2">You are repaying</div>
                <div className="text-2xl font-bold text-white">
                  {selectedBorrow.amount.toFixed(4)} {selectedBorrow.token.symbol}
                </div>
                <div className="text-sm text-gray-400">
                  ≈ {formatCurrency(selectedBorrow.amount * selectedBorrow.token.price)}
                </div>
              </div>
              <div className="text-xs text-green-200 text-center bg-green-900 bg-opacity-20 border border-green-700 rounded p-2">
                ✓ This will reduce your debt and improve your health factor
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRepayModal(false);
                  setSelectedBorrow(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRepayConfirm}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 rounded-lg font-medium transition"
              >
                {isLoading ? <ButtonLoading text="Repaying..." /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BorrowTable;