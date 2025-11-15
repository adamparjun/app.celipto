import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/utils/formatters';
import { CHAIN_IDS, SUPPORTED_CHAINS } from '@/utils/constants';
import { 
  Wallet, 
  LogOut, 
  Copy, 
  ExternalLink, 
  Check,
  ChevronDown,
  AlertCircle 
} from 'lucide-react';

const WalletConnect = () => {
  const { 
    account, 
    chainId, 
    isConnecting, 
    isConnected, 
    connectWallet, 
    disconnectWallet,
    switchNetwork,
    error 
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  const isWrongNetwork = isConnected && chainId !== CHAIN_IDS.ETHEREUM_MAINNET;

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnExplorer = () => {
    if (account && currentChain) {
      const explorerUrl = currentChain.blockExplorerUrls.default;
      window.open(`${explorerUrl}/address/${account}`, '_blank');
    }
  };

  const handleSwitchNetwork = async () => {
    await switchNetwork(CHAIN_IDS.ETHEREUM_MAINNET);
  };

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
        >
          <Wallet size={18} />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>

        {error && (
          <div className="absolute top-full mt-2 right-0 bg-red-900 border border-red-700 rounded-lg p-3 w-72">
            <div className="flex items-start space-x-2">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-200">Connection Error</div>
                <div className="text-xs text-red-300 mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Wrong Network Warning */}
      {isWrongNetwork && (
        <button
          onClick={handleSwitchNetwork}
          className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition mr-2"
        >
          <AlertCircle size={16} />
          <span className="hidden sm:inline">Wrong Network</span>
        </button>
      )}

      {/* Connected Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 px-4 py-2.5 rounded-lg transition-all"
      >
        {/* Chain Indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div className="hidden sm:flex flex-col items-start">
            <div className="text-xs text-gray-400">
              {currentChain?.name || 'Unknown'}
            </div>
            <div className="text-sm font-medium text-white">
              {formatAddress(account)}
            </div>
          </div>
          <div className="sm:hidden text-sm font-medium text-white">
            {formatAddress(account, 4, 4)}
          </div>
        </div>
        
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Account Info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Connected Account</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  isWrongNetwork 
                    ? 'bg-yellow-900 text-yellow-200' 
                    : 'bg-green-900 text-green-200'
                }`}>
                  {isWrongNetwork ? 'Wrong Network' : 'Connected'}
                </span>
              </div>
              <div className="font-mono text-sm text-white break-all">
                {account}
              </div>
              {currentChain && (
                <div className="text-xs text-gray-400 mt-2">
                  Network: {currentChain.name}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={copyAddress}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-750 rounded-lg transition text-left"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-400" />
                    <span className="text-sm text-green-400">Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-gray-400" />
                    <span className="text-sm text-white">Copy Address</span>
                  </>
                )}
              </button>

              <button
                onClick={viewOnExplorer}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-750 rounded-lg transition text-left"
              >
                <ExternalLink size={16} className="text-gray-400" />
                <span className="text-sm text-white">View on Explorer</span>
              </button>

              {isWrongNetwork && (
                <button
                  onClick={handleSwitchNetwork}
                  className="w-full flex items-center space-x-3 px-3 py-2 bg-yellow-900 hover:bg-yellow-800 rounded-lg transition text-left mt-2"
                >
                  <AlertCircle size={16} className="text-yellow-200" />
                  <span className="text-sm text-yellow-200">Switch to Ethereum</span>
                </button>
              )}
            </div>

            {/* Disconnect */}
            <div className="p-2 border-t border-gray-700">
              <button
                onClick={() => {
                  disconnectWallet();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-red-900 rounded-lg transition text-left"
              >
                <LogOut size={16} className="text-red-400" />
                <span className="text-sm text-red-400">Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletConnect;