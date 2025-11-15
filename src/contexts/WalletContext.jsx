import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getProvider, 
  getSigner, 
  requestAccounts, 
  getCurrentAccount, 
  getChainId, 
  switchChain,
  getBalance 
} from '@/utils/web3';
import { CHAIN_IDS, STORAGE_KEYS } from '@/utils/constants';

// Create Wallet Context
const WalletContext = createContext(undefined);

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  /**
   * Initialize provider and signer
   */
  const initializeProvider = useCallback(async () => {
    try {
      const web3Provider = getProvider();
      if (web3Provider) {
        setProvider(web3Provider);
        const web3Signer = await getSigner();
        setSigner(web3Signer);
      }
    } catch (err) {
      console.error('Error initializing provider:', err);
    }
  }, []);

  /**
   * Load account data
   */
  const loadAccountData = useCallback(async (address) => {
    if (!address) return;

    try {
      // Get balance
      const ethBalance = await getBalance(address);
      setBalance(ethBalance);

      // Get chain ID
      const currentChainId = await getChainId();
      setChainId(currentChainId);
    } catch (err) {
      console.error('Error loading account data:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if wallet exists
      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask or another Web3 wallet.');
      }

      // Request accounts
      const accounts = await requestAccounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);
      setIsConnected(true);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
      localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, selectedAccount);

      // Load account data
      await loadAccountData(selectedAccount);

      // Initialize provider
      await initializeProvider();

      console.log('Wallet connected:', selectedAccount);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [loadAccountData, initializeProvider]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ACCOUNT);

    console.log('Wallet disconnected');
  }, []);

  /**
   * Switch network
   */
  const switchNetwork = useCallback(async (targetChainId) => {
    try {
      const success = await switchChain(targetChainId);
      
      if (success) {
        setChainId(targetChainId);
        console.log(`Switched to chain ${targetChainId}`);
        return true;
      } else {
        throw new Error('Failed to switch network');
      }
    } catch (err) {
      console.error('Error switching network:', err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Refresh balance
   */
  const refreshBalance = useCallback(async () => {
    if (account) {
      await loadAccountData(account);
    }
  }, [account, loadAccountData]);

  /**
   * Handle account changed
   */
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnectWallet();
    } else if (accounts[0] !== account) {
      // Account changed
      const newAccount = accounts[0];
      setAccount(newAccount);
      localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, newAccount);
      loadAccountData(newAccount);
      console.log('Account changed:', newAccount);
    }
  }, [account, disconnectWallet, loadAccountData]);

  /**
   * Handle chain changed
   */
  const handleChainChanged = useCallback((chainIdHex) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    console.log('Chain changed:', newChainId);
    
    // Reload the page as recommended by MetaMask
    window.location.reload();
  }, []);

  /**
   * Check if already connected on mount
   */
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED);
      
      if (wasConnected === 'true') {
        const currentAccount = await getCurrentAccount();
        
        if (currentAccount) {
          setAccount(currentAccount);
          setIsConnected(true);
          await loadAccountData(currentAccount);
          await initializeProvider();
        } else {
          // Clear stale connection
          localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
        }
      }
    };

    checkConnection();
  }, [loadAccountData, initializeProvider]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', handleChainChanged);

    // Listen for disconnect
    window.ethereum.on('disconnect', () => {
      console.log('Wallet disconnected');
      disconnectWallet();
    });

    // Cleanup listeners
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', disconnectWallet);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, disconnectWallet]);

  /**
   * Check if on correct network
   */
  const isCorrectNetwork = useCallback((targetChainId = CHAIN_IDS.ETHEREUM_MAINNET) => {
    return chainId === targetChainId;
  }, [chainId]);

  // Context value
  const value = {
    // State
    account,
    chainId,
    balance,
    isConnecting,
    isConnected,
    error,
    provider,
    signer,
    
    // Methods
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
    isCorrectNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use Wallet Context
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  
  return context;
};

export default WalletContext;