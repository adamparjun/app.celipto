// ERC20 Token ABI (Standard functions needed for DeFi)
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// Lending Pool ABI (Based on Aave V2/V3 style)
export const LENDING_POOL_ABI = [
  // Supply/Deposit functions
  'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
  
  // Borrow/Repay functions
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf) returns (uint256)',
  
  // View functions
  'function getUserAccountData(address user) view returns (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  'function getReserveData(address asset) view returns (uint256 configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)',
  
  // Liquidation
  'function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken)',
  
  // Events
  'event Deposit(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referralCode)',
  'event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount)',
  'event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint256 borrowRateMode, uint256 borrowRate, uint16 indexed referralCode)',
  'event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount)',
  'event LiquidationCall(address indexed collateralAsset, address indexed debtAsset, address indexed user, uint256 debtToCover, uint256 liquidatedCollateralAmount, address liquidator, bool receiveAToken)',
];

// aToken ABI (Interest-bearing token received when supplying)
export const ATOKEN_ABI = [
  'function balanceOf(address user) view returns (uint256)',
  'function scaledBalanceOf(address user) view returns (uint256)',
  'function getScaledUserBalanceAndSupply(address user) view returns (uint256, uint256)',
  'function totalSupply() view returns (uint256)',
  'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Mint(address indexed from, uint256 value, uint256 index)',
  'event Burn(address indexed from, address indexed target, uint256 value, uint256 index)',
];

// Variable Debt Token ABI
export const DEBT_TOKEN_ABI = [
  'function balanceOf(address user) view returns (uint256)',
  'function scaledBalanceOf(address user) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Mint(address indexed from, address indexed onBehalfOf, uint256 value, uint256 index)',
  'event Burn(address indexed user, uint256 amount, uint256 index)',
];

// Price Oracle ABI (Chainlink style)
export const PRICE_ORACLE_ABI = [
  'function getAssetPrice(address asset) view returns (uint256)',
  'function getAssetsPrices(address[] calldata assets) view returns (uint256[] memory)',
  'function getSourceOfAsset(address asset) view returns (address)',
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
];

// Interest Rate Strategy ABI
export const INTEREST_RATE_STRATEGY_ABI = [
  'function calculateInterestRates(address reserve, uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 averageStableBorrowRate, uint256 reserveFactor) view returns (uint256 liquidityRate, uint256 stableBorrowRate, uint256 variableBorrowRate)',
  'function OPTIMAL_UTILIZATION_RATE() view returns (uint256)',
  'function EXCESS_UTILIZATION_RATE() view returns (uint256)',
  'function baseVariableBorrowRate() view returns (uint256)',
  'function variableRateSlope1() view returns (uint256)',
  'function variableRateSlope2() view returns (uint256)',
];

// WETH (Wrapped ETH) ABI
export const WETH_ABI = [
  ...ERC20_ABI,
  'function deposit() payable',
  'function withdraw(uint256 wad)',
  'event Deposit(address indexed dst, uint256 wad)',
  'event Withdrawal(address indexed src, uint256 wad)',
];

// Yield Vault ABI (For yield farming strategies)
export const YIELD_VAULT_ABI = [
  'function deposit(uint256 amount) returns (uint256)',
  'function withdraw(uint256 shares) returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function pricePerShare() view returns (uint256)',
  'function earned(address account) view returns (uint256)',
  'function getReward()',
  'function compound()',
  'event Deposit(address indexed user, uint256 amount, uint256 shares)',
  'event Withdraw(address indexed user, uint256 shares, uint256 amount)',
  'event RewardPaid(address indexed user, uint256 reward)',
];

// Staking Contract ABI
export const STAKING_ABI = [
  'function stake(uint256 amount)',
  'function withdraw(uint256 amount)',
  'function getReward()',
  'function earned(address account) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function rewardPerToken() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
  'event RewardPaid(address indexed user, uint256 reward)',
];

// Multi-call Contract ABI (for batch calls)
export const MULTICALL_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes[] returnData)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)',
  'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
];

// Helper functions to get contract interfaces
export const getContractInterface = (contractType) => {
  const interfaces = {
    ERC20: ERC20_ABI,
    LENDING_POOL: LENDING_POOL_ABI,
    ATOKEN: ATOKEN_ABI,
    DEBT_TOKEN: DEBT_TOKEN_ABI,
    PRICE_ORACLE: PRICE_ORACLE_ABI,
    INTEREST_RATE_STRATEGY: INTEREST_RATE_STRATEGY_ABI,
    WETH: WETH_ABI,
    YIELD_VAULT: YIELD_VAULT_ABI,
    STAKING: STAKING_ABI,
    MULTICALL: MULTICALL_ABI,
  };
  
  return interfaces[contractType] || null;
};

// Contract address getter helper
export const getContractAddress = (contractName, chainId = 1) => {
  // This would normally fetch from a config based on chain
  // For now, returning placeholder values
  const addresses = {
    1: { // Ethereum Mainnet
      LENDING_POOL: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      PRICE_ORACLE: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      MULTICALL: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    },
    // Add more chains as needed
  };
  
  return addresses[chainId]?.[contractName] || null;
};

// Export all ABIs
export default {
  ERC20_ABI,
  LENDING_POOL_ABI,
  ATOKEN_ABI,
  DEBT_TOKEN_ABI,
  PRICE_ORACLE_ABI,
  INTEREST_RATE_STRATEGY_ABI,
  WETH_ABI,
  YIELD_VAULT_ABI,
  STAKING_ABI,
  MULTICALL_ABI,
  getContractInterface,
  getContractAddress,
};