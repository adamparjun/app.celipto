// Chain IDs
export const CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  ETHEREUM_GOERLI: 5,
  ETHEREUM_SEPOLIA: 11155111,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
  BSC: 56,
  BSC_TESTNET: 97,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  AVALANCHE: 43114,
};

// Supported Chains
export const SUPPORTED_CHAINS = [
  {
    id: CHAIN_IDS.ETHEREUM_MAINNET,
    name: 'Ethereum',
    network: 'mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com',
      public: 'https://eth.llamarpc.com',
    },
    blockExplorerUrls: {
      default: 'https://etherscan.io',
    },
  },
  {
    id: CHAIN_IDS.ETHEREUM_SEPOLIA,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: 'https://rpc.sepolia.org',
      public: 'https://rpc.sepolia.org',
    },
    blockExplorerUrls: {
      default: 'https://sepolia.etherscan.io',
    },
    testnet: true,
  },
];

// Contract Addresses (Ethereum Mainnet)
export const CONTRACT_ADDRESSES = {
  LENDING_POOL: process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS || '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
  PRICE_ORACLE: process.env.NEXT_PUBLIC_CHAINLINK_ORACLE || '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  // Stablecoins
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: process.env.NEXT_PUBLIC_DAI_ADDRESS || '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  // Wrapped Assets
  WETH: process.env.NEXT_PUBLIC_WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  WBTC: process.env.NEXT_PUBLIC_WBTC_ADDRESS || '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
};

// Supported Tokens
export const SUPPORTED_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: CONTRACT_ADDRESSES.WETH,
    decimals: 18,
    logo: '/assets/tokens/eth.png',
    isNative: true,
    supplyAPY: 3.5,
    borrowAPY: 5.2,
    ltv: 0.825, // Loan to Value ratio (82.5%)
    liquidationThreshold: 0.86,
    liquidationBonus: 0.05,
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: CONTRACT_ADDRESSES.WBTC,
    decimals: 8,
    logo: '/assets/tokens/wbtc.png',
    supplyAPY: 2.8,
    borrowAPY: 4.9,
    ltv: 0.7,
    liquidationThreshold: 0.75,
    liquidationBonus: 0.1,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: CONTRACT_ADDRESSES.USDC,
    decimals: 6,
    logo: '/assets/tokens/usdc.png',
    isStablecoin: true,
    supplyAPY: 4.2,
    borrowAPY: 6.8,
    ltv: 0.87,
    liquidationThreshold: 0.9,
    liquidationBonus: 0.045,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: CONTRACT_ADDRESSES.USDT,
    decimals: 6,
    logo: '/assets/tokens/usdt.png',
    isStablecoin: true,
    supplyAPY: 4.1,
    borrowAPY: 6.7,
    ltv: 0.8,
    liquidationThreshold: 0.85,
    liquidationBonus: 0.05,
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: CONTRACT_ADDRESSES.DAI,
    decimals: 18,
    logo: '/assets/tokens/dai.png',
    isStablecoin: true,
    supplyAPY: 4.0,
    borrowAPY: 6.5,
    ltv: 0.85,
    liquidationThreshold: 0.88,
    liquidationBonus: 0.045,
  },
];

// Transaction Types
export const TX_TYPES = {
  SUPPLY: 'supply',
  WITHDRAW: 'withdraw',
  BORROW: 'borrow',
  REPAY: 'repay',
  LIQUIDATE: 'liquidate',
  APPROVE: 'approve',
};

// Transaction Status
export const TX_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

// Time Constants
export const TIME_CONSTANTS = {
  SECONDS_PER_YEAR: 31536000,
  SECONDS_PER_DAY: 86400,
  BLOCKS_PER_YEAR: 2628000, // Approximate for Ethereum
};

// APY Calculation Constants
export const APY_CONSTANTS = {
  RAY: 10 ** 27,
  WAD: 10 ** 18,
  HALF_RAY: 10 ** 27 / 2,
  HALF_WAD: 10 ** 18 / 2,
};

// Gas Limit Estimates
export const GAS_LIMITS = {
  SUPPLY: 250000,
  WITHDRAW: 300000,
  BORROW: 350000,
  REPAY: 300000,
  APPROVE: 50000,
  LIQUIDATE: 500000,
};

// Health Factor Thresholds
export const HEALTH_FACTOR = {
  CRITICAL: 1.0,
  WARNING: 1.2,
  SAFE: 1.5,
  HEALTHY: 2.0,
};

// API Endpoints
export const API_ENDPOINTS = {
  COINGECKO: 'https://api.coingecko.com/api/v3',
  ETHERSCAN: 'https://api.etherscan.io/api',
  PRICE_FEED: '/api/prices',
  TRANSACTIONS: '/api/transactions',
  USER_DATA: '/api/user',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_CONNECTED: 'wallet_connected',
  SELECTED_ACCOUNT: 'selected_account',
  THEME: 'theme',
  SLIPPAGE: 'slippage',
  DEADLINE: 'deadline',
  RECENT_TRANSACTIONS: 'recent_transactions',
};

// Default Values
export const DEFAULTS = {
  SLIPPAGE: 0.5, // 0.5%
  DEADLINE: 20, // 20 minutes
  GAS_PRICE_MULTIPLIER: 1.1, // 10% above estimated
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_AMOUNT: 'Invalid amount entered',
  AMOUNT_TOO_HIGH: 'Amount exceeds available balance',
  COLLATERAL_TOO_LOW: 'Insufficient collateral',
  HEALTH_FACTOR_TOO_LOW: 'Health factor too low. Transaction would put you at risk of liquidation.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SUPPLY_SUCCESS: 'Successfully supplied assets',
  WITHDRAW_SUCCESS: 'Successfully withdrawn assets',
  BORROW_SUCCESS: 'Successfully borrowed assets',
  REPAY_SUCCESS: 'Successfully repaid loan',
  APPROVE_SUCCESS: 'Token approved successfully',
};

export default {
  CHAIN_IDS,
  SUPPORTED_CHAINS,
  CONTRACT_ADDRESSES,
  SUPPORTED_TOKENS,
  TX_TYPES,
  TX_STATUS,
  TIME_CONSTANTS,
  APY_CONSTANTS,
  GAS_LIMITS,
  HEALTH_FACTOR,
  API_ENDPOINTS,
  STORAGE_KEYS,
  DEFAULTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};