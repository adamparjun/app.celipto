import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { WalletProvider } from '@/contexts/WalletContext';
import { ContractProvider } from '@/contexts/ContractContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import YieldChart from '@/components/yield/YieldChart';
import { useContract } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { useSupply } from '@/hooks/useSupply';
import { useBorrow } from '@/hooks/useBorrow';
import { useYield } from '@/hooks/useYield';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Wallet as WalletIcon, 
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { SUPPORTED_TOKENS } from '@/utils/constants';

const StatCard = ({ icon: Icon, label, value, change, trend, color = 'blue' }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-${color}-600 bg-opacity-20 rounded-lg flex items-center justify-center`}>
        <Icon className={`text-${color}-400`} size={24} />
      </div>
      {change && (
        <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{change}</span>
        </div>
      )}
    </div>
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const DashboardContent = () => {
  const { account, isConnected } = useWallet();
  const { totalSupplied, totalBorrowed, healthFactor } = useContract();
  const { supplySummary } = useSupply();
  const { borrowSummary } = useBorrow();
  const { yieldSummary } = useYield();

  const netWorth = totalSupplied - totalBorrowed;
  const utilizationRate = totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {isConnected ? 'Welcome Back!' : 'Welcome to DeFi Lending'}
        </h1>
        <p className="text-gray-400">
          {isConnected 
            ? 'Here\'s your portfolio overview'
            : 'Supply assets, borrow instantly, and earn yield on your crypto'
          }
        </p>
      </div>

      {isConnected ? (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={WalletIcon} 
              label="Net Worth" 
              value={formatCurrency(netWorth)} 
              change="+12.5%" 
              trend="up"
              color="blue"
            />
            <StatCard 
              icon={TrendingUp} 
              label="Total Supplied" 
              value={supplySummary.totalSupplied}
              color="green"
            />
            <StatCard 
              icon={Activity} 
              label="Total Borrowed" 
              value={borrowSummary.totalBorrowed}
              color="purple"
            />
            <StatCard 
              icon={Shield} 
              label="Health Factor" 
              value={healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
              color="yellow"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-900 to-emerald-900 bg-opacity-30 border border-green-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm text-green-300">Daily Earnings</div>
                  <div className="text-2xl font-bold text-green-400">
                    {yieldSummary.estimatedDailyYield}
                  </div>
                </div>
              </div>
              <div className="text-xs text-green-300">
                From {supplySummary.totalPositions} supply position(s)
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-pink-900 bg-opacity-30 border border-purple-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm text-purple-300">Utilization</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatPercent(utilizationRate)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-purple-300">
                Of your collateral
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 bg-opacity-30 border border-blue-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm text-blue-300">Avg Supply APY</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {supplySummary.averageAPY}
                  </div>
                </div>
              </div>
              <div className="text-xs text-blue-300">
                Earning interest on deposits
              </div>
            </div>
          </div>

          {/* Chart */}
          <YieldChart />

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/supply">
                <a className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg p-4 transition text-center">
                  <TrendingUp size={32} className="text-white mx-auto mb-2" />
                  <div className="font-semibold text-white">Supply Assets</div>
                  <div className="text-sm text-blue-200 mt-1">Start earning interest</div>
                </a>
              </Link>

              <Link href="/borrow">
                <a className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg p-4 transition text-center">
                  <Activity size={32} className="text-white mx-auto mb-2" />
                  <div className="font-semibold text-white">Borrow Assets</div>
                  <div className="text-sm text-purple-200 mt-1">Get instant liquidity</div>
                </a>
              </Link>

              <Link href="/yield">
                <a className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 rounded-lg p-4 transition text-center">
                  <DollarSign size={32} className="text-white mx-auto mb-2" />
                  <div className="font-semibold text-white">View Yield</div>
                  <div className="text-sm text-green-200 mt-1">Track your earnings</div>
                </a>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Hero Section for Non-Connected Users */}
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 md:p-12 text-center border border-gray-700">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Earn Up to 15% APY on Your Crypto
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Supply assets to earn interest, borrow against your collateral, and maximize your DeFi yields
            </p>
            <button className="bg-white text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
              Connect Wallet to Get Started
            </button>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={DollarSign} 
              label="Total Value Locked" 
              value="$15.42B"
              color="blue"
            />
            <StatCard 
              icon={WalletIcon} 
              label="Active Users" 
              value="145K+"
              color="green"
            />
            <StatCard 
              icon={Activity} 
              label="Transactions" 
              value="2.3M+"
              color="purple"
            />
          </div>

          {/* Top Markets */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Top Markets</h3>
              <p className="text-sm text-gray-400 mt-1">Highest yield opportunities</p>
            </div>
            <div className="divide-y divide-gray-700">
              {SUPPORTED_TOKENS.map((token) => (
                <div key={token.symbol} className="p-6 hover:bg-gray-750 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">
                        {formatPercent(token.supplyAPY)}
                      </div>
                      <div className="text-xs text-gray-400">Supply APY</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure & Audited</h3>
              <p className="text-sm text-gray-400">
                Smart contracts audited by leading security firms. Your assets are protected.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-green-600 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} className="text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Liquidity</h3>
              <p className="text-sm text-gray-400">
                Borrow assets instantly without selling your holdings. Maintain your positions.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-purple-600 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Maximize Yields</h3>
              <p className="text-sm text-gray-400">
                Earn competitive APY on your deposits with automatic compounding.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function HomePage() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <Head>
            <title>DeFi Lending - Supply, Borrow & Earn</title>
            <meta name="description" content="Decentralized lending protocol. Supply assets to earn interest, borrow against collateral, and maximize your DeFi yields." />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <Header />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardContent />
          </main>

          <Footer />
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}