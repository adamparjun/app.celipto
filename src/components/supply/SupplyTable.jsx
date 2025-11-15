import React, { useState } from 'react';
import { TrendingUp, ArrowDownToLine, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercent, formatRelativeTime } from '@/utils/formatters';
import { useSupply } from '@/hooks/useSupply';
import { ButtonLoading } from '@/components/common/Loading';

const SupplyTable = ({ supplies, onWithdraw }) => {
  const { isLoading } = useSupply();
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);

  const handleWithdrawClick = (supply) => {
    setSelectedSupply(supply);
    setShowWithdrawModal(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!selectedSupply) return;

    try {
      setWithdrawingId(selectedSupply.id);
      await onWithdraw(selectedSupply.id);
      setShowWithdrawModal(false);
      setSelectedSupply(null);
    } catch (error) {
      console.error('Withdraw error:', error);
    } finally {
      setWithdrawingId(null);
    }
  };

  if (supplies.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={32} className="text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Supplies Yet</h3>
        <p className="text-gray-400 mb-6">
          Start supplying assets to earn interest
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
          Supply Assets
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">Your Supplies</h3>
            <p className="text-sm text-gray-400">
              {supplies.length} active position{supplies.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="bg-green-900 bg-opacity-30 text-green-400 px-3 py-1 rounded-full">
              Earning Interest
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
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Value (USD)
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  APY
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Earnings
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
              {supplies.map((supply) => {
                const value = supply.amount * supply.token.price;
                const dailyEarnings = (value * supply.apy) / (100 * 365);
                
                return (
                  <tr key={supply.id} className="hover:bg-gray-750 transition">
                    {/* Asset */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
                          {supply.token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{supply.token.symbol}</div>
                          <div className="text-sm text-gray-400">{supply.token.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium text-white">
                        {supply.amount.toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-400">{supply.token.symbol}</div>
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-semibold text-white">
                        {formatCurrency(value)}
                      </div>
                    </td>

                    {/* APY */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <TrendingUp size={14} className="text-green-400" />
                        <span className="font-semibold text-green-400">
                          {formatPercent(supply.apy)}
                        </span>
                      </div>
                    </td>

                    {/* Earnings */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-green-400 font-medium">
                        +{formatCurrency(dailyEarnings)}
                      </div>
                      <div className="text-xs text-gray-400">per day</div>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1 text-sm text-gray-400">
                        <Clock size={14} />
                        <span>{formatRelativeTime(supply.timestamp)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {supply.txHash && (
                          <a
                            href={`https://etherscan.io/tx/${supply.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-700 rounded-lg transition"
                            title="View on Etherscan"
                          >
                            <ExternalLink size={16} className="text-gray-400 hover:text-white" />
                          </a>
                        )}
                        <button
                          onClick={() => handleWithdrawClick(supply)}
                          disabled={withdrawingId === supply.id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1"
                        >
                          {withdrawingId === supply.id ? (
                            <ButtonLoading text="" />
                          ) : (
                            <>
                              <ArrowDownToLine size={14} />
                              <span>Withdraw</span>
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
          {supplies.map((supply) => {
            const value = supply.amount * supply.token.price;
            const dailyEarnings = (value * supply.apy) / (100 * 365);

            return (
              <div key={supply.id} className="p-4">
                {/* Asset Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
                      {supply.token.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{supply.token.symbol}</div>
                      <div className="text-sm text-gray-400">{supply.token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">
                      {formatPercent(supply.apy)}
                    </div>
                    <div className="text-xs text-gray-400">APY</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Amount</div>
                    <div className="font-semibold text-white">
                      {supply.amount.toFixed(4)}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Value</div>
                    <div className="font-semibold text-white">
                      {formatCurrency(value)}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Daily Earnings</div>
                    <div className="font-semibold text-green-400">
                      +{formatCurrency(dailyEarnings)}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Time</div>
                    <div className="text-sm text-white">
                      {formatRelativeTime(supply.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {supply.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${supply.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                    >
                      <ExternalLink size={16} />
                      <span>View Tx</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleWithdrawClick(supply)}
                    disabled={withdrawingId === supply.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-2 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                  >
                    {withdrawingId === supply.id ? (
                      <ButtonLoading text="Withdrawing..." />
                    ) : (
                      <>
                        <ArrowDownToLine size={16} />
                        <span>Withdraw</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && selectedSupply && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Withdrawal</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-2">You are withdrawing</div>
                <div className="text-2xl font-bold text-white">
                  {selectedSupply.amount.toFixed(4)} {selectedSupply.token.symbol}
                </div>
                <div className="text-sm text-gray-400">
                  ≈ {formatCurrency(selectedSupply.amount * selectedSupply.token.price)}
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center">
                You will stop earning interest on this position
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setSelectedSupply(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawConfirm}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-2 rounded-lg font-medium transition"
              >
                {isLoading ? <ButtonLoading text="Withdrawing..." /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplyTable;