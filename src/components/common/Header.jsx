import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import WalletConnect from './WalletConnect';
import { Menu, X, TrendingUp, DollarSign, Wallet, BarChart3 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/formatters';

const Header = () => {
  const router = useRouter();
  const { account, balance } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Supply', href: '/supply', icon: DollarSign },
    { name: 'Borrow', href: '/borrow', icon: TrendingUp },
    { name: 'Yield', href: '/yield', icon: TrendingUp },
    { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  ];

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 backdrop-blur-sm bg-opacity-95">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <DollarSign className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hidden sm:block">
                DeFi Lending
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Balance Display (Desktop) */}
            {account && (
              <div className="hidden lg:flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                <Wallet size={18} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Balance</div>
                  <div className="text-sm font-semibold text-white">
                    {formatCurrency(parseFloat(balance))}
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Connect */}
            <WalletConnect />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Balance */}
              {account && (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg mt-4">
                  <div className="flex items-center space-x-2">
                    <Wallet size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-400">Balance</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(parseFloat(balance))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;