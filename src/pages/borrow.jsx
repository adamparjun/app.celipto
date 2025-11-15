import React from 'react';
import Head from 'next/head';
import { WalletProvider } from '@/contexts/WalletContext';
import { ContractProvider } from '@/contexts/ContractContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BorrowCard from '@/components/borrow/BorrowCard';
import BorrowTable from '@/components/borrow/BorrowTable';
import { useWallet } from '@/hooks/useWallet';
import { useBorrow } from '@/hooks/useBorrow';
import { TrendingDown, Info, AlertTriangle, Shield } from 'lucide-react';
import { SUPPORTED_TOKENS } from '@/utils/constants';
import { CardSkeleton } from '@/components/common/Loading';

const BorrowContent = () => {
  const { isConnected } = useWallet();
  const { 
    borrows, 
    borrow, 
    repay, 
    borrowSummary,
    canBorrow,
    isLoading 
  } = useBorrow();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingDown size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Borrow Assets</h1>
            <p className="text-gray-400">Get instant liquidity against your collateral</p>
          </div>
        </div>
      </div>

      {/* Summary Cards - Only show if connected and has borrows */}
      {isConnected && borrows.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
              <div className="text-sm text-purple-200 mb-1">Total Borrowed</div>
              <div className="text-3xl font-bold text-white mb-2">
                {borrowSummary.totalBorrowed}
              </div>
              <div className="text-xs text-purple-300">
                Across {borrowSummary.totalPositions} position(s)
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl p-6 border border-red-700">
              <div className="text-sm text-red-200 mb-1">Average Borrow APY</div>
              <div className="text-3xl font-bold text-white mb-2">
                {borrowSummary.averageAPY}
              </div>
              <div className="text-xs text-red-300">
                Variable rate
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-xl p-6 border border-orange-700">
              <div className="text-sm text-orange-200 mb-1">Daily Interest</div>
              <div className="text-3xl font-bold text-white mb-2">
                {borrowSummary.dailyInterest}
              </div>
              <div className="text-xs text-orange-300">
                Accruing cost
              </div>
            </div>

            <div className={`bg-gradient-to-br from-${borrowSummary.healthFactorStatus.color}-900 to-${borrowSummary.healthFactorStatus.color}-800 rounded-xl p-6 border border-${borrowSummary.healthFactorStatus.color}-700`}>
              <div className={`text-sm text-${borrowSummary.healthFactorStatus.color}-200 mb-1`}>Health Factor</div>
              <div className="text-3xl font-bold text-white mb-2">
                {borrowSummary.healthFactor}
              </div>
              <div className={`text-xs text-${borrowSummary.healthFactorStatus.color}-300`}>
                {borrowSummary.healthFactorStatus.emoji} {borrowSummary.healthFactorStatus.text}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Available to Borrow</div>
              <div className="text-2xl font-bold text-white">
                {borrowSummary.availableToBorrow}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Collateral Ratio</div>
              <div className="text-2xl font-bold text-white">
                {borrowSummary.collateralRatio}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Utilization Rate</div>
              <div className="text-2xl font-bold text-white">
                {borrowSummary.utilizationRate}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Warning Banner - No Collateral */}
      {isConnected && !canBorrow && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Collateral Required</h3>
              <p className="text-sm text-yellow-200 mb-3">
                You need to supply collateral before you can borrow assets. Head to the Supply page to deposit assets first.
              </p>
              <a 
                href="/supply"
                className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Go to Supply Page
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-purple-900 bg-opacity-20 border border-purple-700 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Info size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How Borrowing Works</h3>
            <div className="text-sm text-purple-200 space-y-1">
              <p>• Borrow assets instantly against your supplied collateral</p>
              <p>• Pay variable interest rates that adjust based on market utilization</p>
              <p>• Maintain a healthy collateral ratio to avoid liquidation</p>
              <p>• Repay anytime to reduce your debt and improve your health factor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Factor Warning */}
      {isConnected && canBorrow && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Understanding Health Factor</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  Your health factor represents the safety of your collateral relative to your debt. 
                  Keep it above 1.5 to stay safe from liquidation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                  <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-3">
                    <div className="text-xs text-green-300 mb-1">Healthy</div>
                    <div className="font-bold text-green-400">&gt; 2.0</div>
                  </div>
                  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-3">
                    <div className="text-xs text-yellow-300 mb-1">Moderate</div>
                    <div className="font-bold text-yellow-400">1.5 - 2.0</div>
                  </div>
                  <div className="bg-orange-900 bg-opacity-30 border border-orange-700 rounded-lg p-3">
                    <div className="text-xs text-orange-300 mb-1">Warning</div>
                    <div className="font-bold text-orange-400">1.2 - 1.5</div>
                  </div>
                  <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-3">
                    <div className="text-xs text-red-300 mb-1">Critical</div>
                    <div className="font-bold text-red-400">&lt; 1.2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Markets */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Available to Borrow</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select an asset to borrow
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CardSkeleton count={4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SUPPORTED_TOKENS.map((token) => {
              const userBorrow = borrows
                .filter(b => b.token.symbol === token.symbol)
                .reduce((sum, b) => sum + b.amount, 0);

              return (
                <BorrowCard
                  key={token.symbol}
                  token={token}
                  onBorrow={borrow}
                  userBorrowed={userBorrow}
                  availableToBorrow={canBorrow ? parseFloat(borrowSummary.availableToBorrow.replace(/[$,]/g, '')) : 0}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* User Borrows */}
      {isConnected && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Borrow Positions</h2>
          <BorrowTable borrows={borrows} onRepay={repay} />
        </div>
      )}

      {/* Connect Wallet CTA */}
      {!isConnected && (
        <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-12 text-center border border-gray-700">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingDown size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet to Borrow
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect your wallet to access instant liquidity against your collateral
          </p>
        </div>
      )}
    </div>
  );
};

export default function BorrowPage() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <Head>
            <title>Borrow Assets - DeFi Lending</title>
            <meta name="description" content="Borrow crypto assets instantly against your collateral with competitive variable rates." />
          </Head>

          <Header />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BorrowContent />
          </main>

          <Footer />
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}