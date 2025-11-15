import React, { useState } from 'react';
import Head from 'next/head';
import { WalletProvider } from '@/contexts/WalletContext';
import { ContractProvider } from '@/contexts/ContractContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import YieldCard from '@/components/yield/YieldCard';
import YieldChart from '@/components/yield/YieldChart';
import APYDisplay from '@/components/yield/APYDisplay';
import { useWallet } from '@/hooks/useWallet';
import { useSupply } from '@/hooks/useSupply';
import { useYield } from '@/hooks/useYield';
import { TrendingUp, Sparkles, Info, DollarSign, Calendar } from 'lucide-react';
import { SUPPORTED_TOKENS } from '@/utils/constants';
import { CardSkeleton } from '@/components/common/Loading';

const YieldContent = () => {
  const { isConnected } = useWallet();
  const { supplies } = useSupply();
  const { 
    yieldSummary,
    yieldHistory,
    selectedPeriod,
    setSelectedPeriod,
    topYieldOpportunities,
    yieldBreakdown,
    isLoading 
  } = useYield();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Yield Farming</h1>
            <p className="text-gray-400">Track and maximize your earnings</p>
          </div>
        </div>
      </div>

      {/* Summary Cards - Only show if connected */}
      {isConnected && supplies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-6 border border-green-700">
            <div className="flex items-center space-x-2 text-green-200 text-sm mb-2">
              <Sparkles size={16} />
              <span>Total Earned</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {yieldSummary.totalYieldEarned}
            </div>
            <div className="text-xs text-green-300">
              All-time earnings
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
            <div className="flex items-center space-x-2 text-blue-200 text-sm mb-2">
              <Calendar size={16} />
              <span>Daily Yield</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {yieldSummary.estimatedDailyYield}
            </div>
            <div className="text-xs text-blue-300">
              Current rate
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
            <div className="flex items-center space-x-2 text-purple-200 text-sm mb-2">
              <TrendingUp size={16} />
              <span>Average APY</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {yieldSummary.averageAPY}
            </div>
            <div className="text-xs text-purple-300">
              Weighted by value
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-6 border border-yellow-700">
            <div className="flex items-center space-x-2 text-yellow-200 text-sm mb-2">
              <DollarSign size={16} />
              <span>Monthly Projection</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {yieldSummary.estimatedMonthlyYield}
            </div>
            <div className="text-xs text-yellow-300">
              Based on current APY
            </div>
          </div>
        </div>
      )}

      {/* APY Overview */}
      {isConnected && supplies.length > 0 && (
        <APYDisplay 
          supplyAPY={parseFloat(yieldSummary.averageAPY.replace('%', ''))}
          userSupplied={parseFloat(yieldSummary.totalSupplied.replace(/[$,]/g, ''))}
        />
      )}

      {/* Yield Chart */}
      {isConnected && supplies.length > 0 && (
        <YieldChart 
          yieldHistory={yieldHistory}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      )}

      {/* Yield Breakdown by Token */}
      {isConnected && yieldBreakdown.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white mb-1">Yield Breakdown</h3>
            <p className="text-sm text-gray-400">Earnings by asset</p>
          </div>

          <div className="divide-y divide-gray-700">
            {yieldBreakdown.map((item, index) => (
              <div key={index} className="p-6 hover:bg-gray-750 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center font-bold text-white">
                      {item.token.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.token.symbol}</div>
                      <div className="text-sm text-gray-400">
                        {item.suppliedAmount.toFixed(4)} supplied
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-lg">
                      {item.apy.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">APY</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Daily</div>
                    <div className="font-semibold text-green-400">
                      +${item.dailyYield.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Monthly</div>
                    <div className="font-semibold text-white">
                      +${item.monthlyYield.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Yearly</div>
                    <div className="font-semibold text-white">
                      +${item.yearlyYield.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Info size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">About Yield Farming</h3>
            <div className="text-sm text-green-200 space-y-1">
              <p>• Your supplied assets automatically earn interest with every Ethereum block</p>
              <p>• Interest compounds continuously, maximizing your returns over time</p>
              <p>• APY rates are variable and adjust based on supply and demand</p>
              <p>• All earnings are automatically added to your supplied balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isConnected && supplies.length > 0 ? 'Your Positions' : 'Top Yield Opportunities'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isConnected && supplies.length > 0 
                ? 'Assets currently earning yield'
                : 'Highest APY available'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm text-gray-300">Auto-compounding</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton count={3} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isConnected && supplies.length > 0 ? (
              // Show user's positions
              SUPPORTED_TOKENS.map((token) => {
                const userSupply = supplies
                  .filter(s => s.token.symbol === token.symbol)
                  .reduce((sum, s) => sum + s.amount, 0);

                if (userSupply === 0) return null;

                return (
                  <YieldCard
                    key={token.symbol}
                    token={token}
                    userSupplied={userSupply}
                  />
                );
              }).filter(Boolean)
            ) : (
              // Show top opportunities
              topYieldOpportunities.map((token) => (
                <YieldCard
                  key={token.symbol}
                  token={token}
                  userSupplied={0}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Connect Wallet CTA */}
      {!isConnected && (
        <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-12 text-center border border-gray-700">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet to Track Yield
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect your wallet to view your earnings and optimize your yield strategy
          </p>
        </div>
      )}

      {/* Empty State */}
      {isConnected && supplies.length === 0 && (
        <div className="bg-gray-800 rounded-2xl p-12 text-center border border-gray-700">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={40} className="text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            No Active Positions
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Start supplying assets to earn yield and track your earnings here
          </p>
          <a 
            href="/supply"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <DollarSign size={20} className="mr-2" />
            Start Earning Yield
          </a>
        </div>
      )}
    </div>
  );
};

export default function YieldPage() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <Head>
            <title>Yield Farming - DeFi Lending</title>
            <meta name="description" content="Track your yield farming performance and maximize your DeFi earnings with auto-compounding." />
          </Head>

          <Header />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <YieldContent />
          </main>

          <Footer />
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}