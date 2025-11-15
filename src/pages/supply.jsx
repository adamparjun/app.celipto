import React from 'react';
import Head from 'next/head';
import { WalletProvider } from '@/contexts/WalletContext';
import { ContractProvider } from '@/contexts/ContractContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import SupplyCard from '@/components/supply/SupplyCard';
import SupplyTable from '@/components/supply/SupplyTable';
import { useWallet } from '@/hooks/useWallet';
import { useSupply } from '@/hooks/useSupply';
import { TrendingUp, Info, Sparkles } from 'lucide-react';
import { SUPPORTED_TOKENS } from '@/utils/constants';
import { CardSkeleton } from '@/components/common/Loading';

const SupplyContent = () => {
  const { isConnected } = useWallet();
  const { 
    supplies, 
    supply, 
    withdraw, 
    supplySummary, 
    isLoading 
  } = useSupply();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Supply Assets</h1>
            <p className="text-gray-400">Deposit crypto and earn interest</p>
          </div>
        </div>
      </div>

      {/* Summary Cards - Only show if connected and has supplies */}
      {isConnected && supplies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
            <div className="text-sm text-blue-200 mb-1">Total Supplied</div>
            <div className="text-3xl font-bold text-white mb-2">
              {supplySummary.totalSupplied}
            </div>
            <div className="text-xs text-blue-300">
              Across {supplySummary.totalPositions} position(s)
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700">
            <div className="text-sm text-green-200 mb-1">Average APY</div>
            <div className="text-3xl font-bold text-white mb-2">
              {supplySummary.averageAPY}
            </div>
            <div className="text-xs text-green-300">
              Weighted by value
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
            <div className="text-sm text-purple-200 mb-1">Daily Earnings</div>
            <div className="text-3xl font-bold text-white mb-2">
              {supplySummary.dailyEarnings}
            </div>
            <div className="text-xs text-purple-300">
              Compounding every block
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-6 border border-yellow-700">
            <div className="text-sm text-yellow-200 mb-1">Yearly Projection</div>
            <div className="text-3xl font-bold text-white mb-2">
              {supplySummary.yearlyEarnings}
            </div>
            <div className="text-xs text-yellow-300">
              At current rates
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Info size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How Supply Works</h3>
            <div className="text-sm text-blue-200 space-y-1">
              <p>• Supply your crypto assets to the lending pool and start earning interest immediately</p>
              <p>• Interest compounds automatically with every Ethereum block (~12 seconds)</p>
              <p>• Your supplied assets can be used as collateral to borrow other assets</p>
              <p>• Withdraw your assets anytime without any lock-up period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Markets */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Available Markets</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select an asset to supply
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm text-gray-300">Auto-compounding enabled</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CardSkeleton count={4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SUPPORTED_TOKENS.map((token) => {
              const userSupply = supplies
                .filter(s => s.token.symbol === token.symbol)
                .reduce((sum, s) => sum + s.amount, 0);

              return (
                <SupplyCard
                  key={token.symbol}
                  token={token}
                  onSupply={supply}
                  userBalance={userSupply}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* User Supplies */}
      {isConnected && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Supply Positions</h2>
          <SupplyTable supplies={supplies} onWithdraw={withdraw} />
        </div>
      )}

      {/* Connect Wallet CTA */}
      {!isConnected && (
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-12 text-center border border-gray-700">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet to Supply
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect your wallet to start earning interest on your crypto assets
          </p>
        </div>
      )}
    </div>
  );
};

export default function SupplyPage() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <Head>
            <title>Supply Assets - DeFi Lending</title>
            <meta name="description" content="Supply crypto assets and earn competitive interest rates with automatic compounding." />
          </Head>

          <Header />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SupplyContent />
          </main>

          <Footer />
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}