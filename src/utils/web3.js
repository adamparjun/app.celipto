import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { CHAIN_IDS, SUPPORTED_CHAINS, CONTRACT_ADDRESSES } from './constants';

/**
 * Get Web3 Provider from window.ethereum
 * @returns {BrowserProvider|null} Ethers provider
 */
export const getProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('No Web3 provider found');
    return null;
  }
  
  return new BrowserProvider(window.ethereum);
};

/**
 * Get signer from provider
 * @returns {Promise<Signer|null>} Ethers signer
 */
export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) return null;
  
  try {
    return await provider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
};

/**
 * Request account access from wallet
 * @returns {Promise<string[]>} Array of addresses
 */
export const requestAccounts = async () => {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet detected');
  }
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts;
  } catch (error) {
    console.error('Error requesting accounts:', error);
    throw error;
  }
};

/**
 * Get current connected account
 * @returns {Promise<string|null>} Current account address
 */
export const getCurrentAccount = async () => {
  if (!window.ethereum) return null;
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Get current network chain ID
 * @returns {Promise<number|null>} Chain ID
 */
export const getChainId = async () => {
  const provider = getProvider();
  if (!provider) return null;
  
  try {
    const network = await provider.getNetwork();
    return Number(network.chainId);
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

/**
 * Switch to a specific chain
 * @param {number} chainId - Target chain ID
 * @returns {Promise<boolean>} Success status
 */
export const switchChain = async (chainId) => {
  if (!window.ethereum) return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error) {
    // Chain not added to wallet
    if (error.code === 4902) {
      return await addChain(chainId);
    }
    console.error('Error switching chain:', error);
    return false;
  }
};

/**
 * Add a chain to the wallet
 * @param {number} chainId - Chain ID to add
 * @returns {Promise<boolean>} Success status
 */
export const addChain = async (chainId) => {
  if (!window.ethereum) return false;
  
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  if (!chain) {
    console.error('Unsupported chain:', chainId);
    return false;
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: [chain.rpcUrls.default],
          blockExplorerUrls: [chain.blockExplorerUrls.default],
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Error adding chain:', error);
    return false;
  }
};

/**
 * Get ETH balance for an address
 * @param {string} address - Ethereum address
 * @returns {Promise<string>} Balance in ETH
 */
export const getBalance = async (address) => {
  const provider = getProvider();
  if (!provider || !address) return '0';
  
  try {
    const balance = await provider.getBalance(address);
    return formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

/**
 * Get ERC20 token balance
 * @param {string} tokenAddress - Token contract address
 * @param {string} userAddress - User's address
 * @param {number} decimals - Token decimals
 * @returns {Promise<string>} Token balance
 */
export const getTokenBalance = async (tokenAddress, userAddress, decimals = 18) => {
  const provider = getProvider();
  if (!provider || !tokenAddress || !userAddress) return '0';
  
  try {
    const ERC20_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
    ];
    
    const contract = new Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    return formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

/**
 * Check if token is approved for spending
 * @param {string} tokenAddress - Token contract address
 * @param {string} owner - Owner address
 * @param {string} spender - Spender address
 * @returns {Promise<string>} Allowance amount
 */
export const getAllowance = async (tokenAddress, owner, spender) => {
  const provider = getProvider();
  if (!provider) return '0';
  
  try {
    const ERC20_ABI = [
      'function allowance(address owner, address spender) view returns (uint256)',
    ];
    
    const contract = new Contract(tokenAddress, ERC20_ABI, provider);
    const allowance = await contract.allowance(owner, spender);
    return allowance.toString();
  } catch (error) {
    console.error('Error getting allowance:', error);
    return '0';
  }
};

/**
 * Approve token spending
 * @param {string} tokenAddress - Token contract address
 * @param {string} spender - Spender address
 * @param {string} amount - Amount to approve (in token units)
 * @returns {Promise<object>} Transaction receipt
 */
export const approveToken = async (tokenAddress, spender, amount) => {
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');
  
  try {
    const ERC20_ABI = [
      'function approve(address spender, uint256 amount) returns (bool)',
    ];
    
    const contract = new Contract(tokenAddress, ERC20_ABI, signer);
    const tx = await contract.approve(spender, amount);
    const receipt = await tx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error approving token:', error);
    throw error;
  }
};

/**
 * Get current gas price
 * @returns {Promise<string>} Gas price in Gwei
 */
export const getGasPrice = async () => {
  const provider = getProvider();
  if (!provider) return '0';
  
  try {
    const feeData = await provider.getFeeData();
    return formatUnits(feeData.gasPrice || 0n, 9); // Convert to Gwei
  } catch (error) {
    console.error('Error getting gas price:', error);
    return '0';
  }
};

/**
 * Estimate gas for a transaction
 * @param {object} transaction - Transaction object
 * @returns {Promise<string>} Estimated gas
 */
export const estimateGas = async (transaction) => {
  const provider = getProvider();
  if (!provider) return '0';
  
  try {
    const estimate = await provider.estimateGas(transaction);
    return estimate.toString();
  } catch (error) {
    console.error('Error estimating gas:', error);
    return '0';
  }
};

/**
 * Wait for transaction confirmation
 * @param {string} txHash - Transaction hash
 * @param {number} confirmations - Number of confirmations to wait
 * @returns {Promise<object>} Transaction receipt
 */
export const waitForTransaction = async (txHash, confirmations = 1) => {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');
  
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};

/**
 * Check if address is valid Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid address
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Get transaction by hash
 * @param {string} txHash - Transaction hash
 * @returns {Promise<object|null>} Transaction object
 */
export const getTransaction = async (txHash) => {
  const provider = getProvider();
  if (!provider) return null;
  
  try {
    const tx = await provider.getTransaction(txHash);
    return tx;
  } catch (error) {
    console.error('Error getting transaction:', error);
    return null;
  }
};

/**
 * Get transaction receipt
 * @param {string} txHash - Transaction hash
 * @returns {Promise<object|null>} Transaction receipt
 */
export const getTransactionReceipt = async (txHash) => {
  const provider = getProvider();
  if (!provider) return null;
  
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    console.error('Error getting transaction receipt:', error);
    return null;
  }
};

/**
 * Get block number
 * @returns {Promise<number>} Current block number
 */
export const getBlockNumber = async () => {
  const provider = getProvider();
  if (!provider) return 0;
  
  try {
    return await provider.getBlockNumber();
  } catch (error) {
    console.error('Error getting block number:', error);
    return 0;
  }
};

/**
 * Add token to wallet
 * @param {string} tokenAddress - Token contract address
 * @param {string} symbol - Token symbol
 * @param {number} decimals - Token decimals
 * @param {string} image - Token image URL
 * @returns {Promise<boolean>} Success status
 */
export const addTokenToWallet = async (tokenAddress, symbol, decimals, image) => {
  if (!window.ethereum) return false;
  
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: symbol,
          decimals: decimals,
          image: image,
        },
      },
    });
    return wasAdded;
  } catch (error) {
    console.error('Error adding token to wallet:', error);
    return false;
  }
};

export default {
  getProvider,
  getSigner,
  requestAccounts,
  getCurrentAccount,
  getChainId,
  switchChain,
  addChain,
  getBalance,
  getTokenBalance,
  getAllowance,
  approveToken,
  getGasPrice,
  estimateGas,
  waitForTransaction,
  isValidAddress,
  getTransaction,
  getTransactionReceipt,
  getBlockNumber,
  addTokenToWallet,
};