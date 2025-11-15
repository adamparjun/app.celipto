import { Contract, formatUnits, parseUnits } from 'ethers';
import { 
  getProvider, 
  getSigner, 
  getBalance, 
  getTokenBalance,
  getAllowance,
  approveToken,
  waitForTransaction 
} from '@/utils/web3';
import { 
  LENDING_POOL_ABI, 
  ERC20_ABI, 
  ATOKEN_ABI,
  DEBT_TOKEN_ABI,
  PRICE_ORACLE_ABI 
} from '@/utils/contracts';
import { CONTRACT_ADDRESSES, SUPPORTED_TOKENS } from '@/utils/constants';

/**
 * Blockchain service for interacting with smart contracts
 */

/**
 * Get lending pool contract instance
 * @param {boolean} withSigner - Whether to use signer (for transactions)
 * @returns {Contract} Contract instance
 */
export const getLendingPoolContract = async (withSigner = false) => {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');

    if (withSigner) {
      const signer = await getSigner();
      if (!signer) throw new Error('Signer not available');
      return new Contract(CONTRACT_ADDRESSES.LENDING_POOL, LENDING_POOL_ABI, signer);
    }

    return new Contract(CONTRACT_ADDRESSES.LENDING_POOL, LENDING_POOL_ABI, provider);
  } catch (error) {
    console.error('Error getting lending pool contract:', error);
    throw error;
  }
};

/**
 * Get ERC20 token contract
 * @param {string} tokenAddress - Token contract address
 * @param {boolean} withSigner - Whether to use signer
 * @returns {Contract} Contract instance
 */
export const getTokenContract = async (tokenAddress, withSigner = false) => {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');

    if (withSigner) {
      const signer = await getSigner();
      if (!signer) throw new Error('Signer not available');
      return new Contract(tokenAddress, ERC20_ABI, signer);
    }

    return new Contract(tokenAddress, ERC20_ABI, provider);
  } catch (error) {
    console.error('Error getting token contract:', error);
    throw error;
  }
};

/**
 * Get user account data from lending pool
 * @param {string} userAddress - User's Ethereum address
 * @returns {Promise<object>} User account data
 */
export const getUserAccountData = async (userAddress) => {
  try {
    const contract = await getLendingPoolContract(false);
    const data = await contract.getUserAccountData(userAddress);

    return {
      totalCollateralETH: parseFloat(formatUnits(data[0], 18)),
      totalDebtETH: parseFloat(formatUnits(data[1], 18)),
      availableBorrowsETH: parseFloat(formatUnits(data[2], 18)),
      currentLiquidationThreshold: parseFloat(formatUnits(data[3], 4)),
      ltv: parseFloat(formatUnits(data[4], 4)),
      healthFactor: parseFloat(formatUnits(data[5], 18)),
    };
  } catch (error) {
    console.error('Error getting user account data:', error);
    throw error;
  }
};

/**
 * Get reserve data for a specific asset
 * @param {string} assetAddress - Asset contract address
 * @returns {Promise<object>} Reserve data
 */
export const getReserveData = async (assetAddress) => {
  try {
    const contract = await getLendingPoolContract(false);
    const data = await contract.getReserveData(assetAddress);

    return {
      configuration: data[0],
      liquidityIndex: data[1],
      variableBorrowIndex: data[2],
      currentLiquidityRate: parseFloat(formatUnits(data[3], 27)),
      currentVariableBorrowRate: parseFloat(formatUnits(data[4], 27)),
      currentStableBorrowRate: parseFloat(formatUnits(data[5], 27)),
      lastUpdateTimestamp: Number(data[6]),
      aTokenAddress: data[7],
      stableDebtTokenAddress: data[8],
      variableDebtTokenAddress: data[9],
      interestRateStrategyAddress: data[10],
      id: Number(data[11]),
    };
  } catch (error) {
    console.error('Error getting reserve data:', error);
    throw error;
  }
};

/**
 * Get aToken balance (supplied amount)
 * @param {string} aTokenAddress - aToken contract address
 * @param {string} userAddress - User's address
 * @returns {Promise<string>} aToken balance
 */
export const getATokenBalance = async (aTokenAddress, userAddress) => {
  try {
    const provider = getProvider();
    const contract = new Contract(aTokenAddress, ATOKEN_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    return formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting aToken balance:', error);
    throw error;
  }
};

/**
 * Get debt token balance (borrowed amount)
 * @param {string} debtTokenAddress - Debt token contract address
 * @param {string} userAddress - User's address
 * @returns {Promise<string>} Debt balance
 */
export const getDebtTokenBalance = async (debtTokenAddress, userAddress) => {
  try {
    const provider = getProvider();
    const contract = new Contract(debtTokenAddress, DEBT_TOKEN_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    return formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting debt token balance:', error);
    throw error;
  }
};

/**
 * Deposit assets to lending pool
 * @param {string} assetAddress - Asset contract address
 * @param {string} amount - Amount to deposit
 * @param {number} decimals - Token decimals
 * @param {string} onBehalfOf - Address to deposit on behalf of
 * @returns {Promise<object>} Transaction receipt
 */
export const deposit = async (assetAddress, amount, decimals, onBehalfOf) => {
  try {
    const contract = await getLendingPoolContract(true);
    const amountInWei = parseUnits(amount, decimals);

    const tx = await contract.deposit(
      assetAddress,
      amountInWei,
      onBehalfOf,
      0 // referral code
    );

    console.log('Deposit transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Deposit confirmed:', receipt.hash);

    return receipt;
  } catch (error) {
    console.error('Error depositing:', error);
    throw error;
  }
};

/**
 * Withdraw assets from lending pool
 * @param {string} assetAddress - Asset contract address
 * @param {string} amount - Amount to withdraw
 * @param {number} decimals - Token decimals
 * @param {string} to - Address to send withdrawn assets
 * @returns {Promise<object>} Transaction receipt
 */
export const withdraw = async (assetAddress, amount, decimals, to) => {
  try {
    const contract = await getLendingPoolContract(true);
    const amountInWei = parseUnits(amount, decimals);

    const tx = await contract.withdraw(assetAddress, amountInWei, to);

    console.log('Withdraw transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Withdraw confirmed:', receipt.hash);

    return receipt;
  } catch (error) {
    console.error('Error withdrawing:', error);
    throw error;
  }
};

/**
 * Borrow assets from lending pool
 * @param {string} assetAddress - Asset contract address
 * @param {string} amount - Amount to borrow
 * @param {number} decimals - Token decimals
 * @param {number} interestRateMode - 1 for stable, 2 for variable
 * @param {string} onBehalfOf - Address to borrow on behalf of
 * @returns {Promise<object>} Transaction receipt
 */
export const borrow = async (
  assetAddress,
  amount,
  decimals,
  interestRateMode,
  onBehalfOf
) => {
  try {
    const contract = await getLendingPoolContract(true);
    const amountInWei = parseUnits(amount, decimals);

    const tx = await contract.borrow(
      assetAddress,
      amountInWei,
      interestRateMode,
      0, // referral code
      onBehalfOf
    );

    console.log('Borrow transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Borrow confirmed:', receipt.hash);

    return receipt;
  } catch (error) {
    console.error('Error borrowing:', error);
    throw error;
  }
};

/**
 * Repay borrowed assets
 * @param {string} assetAddress - Asset contract address
 * @param {string} amount - Amount to repay
 * @param {number} decimals - Token decimals
 * @param {number} rateMode - 1 for stable, 2 for variable
 * @param {string} onBehalfOf - Address to repay on behalf of
 * @returns {Promise<object>} Transaction receipt
 */
export const repay = async (assetAddress, amount, decimals, rateMode, onBehalfOf) => {
  try {
    const contract = await getLendingPoolContract(true);
    const amountInWei = parseUnits(amount, decimals);

    const tx = await contract.repay(assetAddress, amountInWei, rateMode, onBehalfOf);

    console.log('Repay transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Repay confirmed:', receipt.hash);

    return receipt;
  } catch (error) {
    console.error('Error repaying:', error);
    throw error;
  }
};

/**
 * Get all user positions (supplies and borrows)
 * @param {string} userAddress - User's address
 * @returns {Promise<object>} User positions
 */
export const getUserPositions = async (userAddress) => {
  try {
    const positions = {
      supplies: [],
      borrows: [],
    };

    // Get user account data first
    const accountData = await getUserAccountData(userAddress);

    // Get positions for each supported token
    for (const token of SUPPORTED_TOKENS) {
      const reserveData = await getReserveData(token.address);

      // Check supplied amount
      if (reserveData.aTokenAddress) {
        const suppliedBalance = await getATokenBalance(
          reserveData.aTokenAddress,
          userAddress
        );

        if (parseFloat(suppliedBalance) > 0) {
          positions.supplies.push({
            token,
            amount: parseFloat(suppliedBalance),
            apy: reserveData.currentLiquidityRate * 100,
            aTokenAddress: reserveData.aTokenAddress,
          });
        }
      }

      // Check borrowed amount
      if (reserveData.variableDebtTokenAddress) {
        const borrowedBalance = await getDebtTokenBalance(
          reserveData.variableDebtTokenAddress,
          userAddress
        );

        if (parseFloat(borrowedBalance) > 0) {
          positions.borrows.push({
            token,
            amount: parseFloat(borrowedBalance),
            apy: reserveData.currentVariableBorrowRate * 100,
            debtTokenAddress: reserveData.variableDebtTokenAddress,
          });
        }
      }
    }

    return {
      ...positions,
      accountData,
    };
  } catch (error) {
    console.error('Error getting user positions:', error);
    throw error;
  }
};

/**
 * Get asset price from oracle
 * @param {string} assetAddress - Asset contract address
 * @returns {Promise<number>} Asset price in USD
 */
export const getAssetPrice = async (assetAddress) => {
  try {
    const provider = getProvider();
    const contract = new Contract(
      CONTRACT_ADDRESSES.PRICE_ORACLE,
      PRICE_ORACLE_ABI,
      provider
    );

    const price = await contract.getAssetPrice(assetAddress);
    return parseFloat(formatUnits(price, 8)); // Chainlink uses 8 decimals
  } catch (error) {
    console.error('Error getting asset price:', error);
    throw error;
  }
};

/**
 * Calculate health factor after action
 * @param {string} userAddress - User's address
 * @param {string} assetAddress - Asset address
 * @param {string} amount - Amount to add/remove
 * @param {string} action - 'supply', 'withdraw', 'borrow', 'repay'
 * @returns {Promise<number>} New health factor
 */
export const calculateHealthFactorAfterAction = async (
  userAddress,
  assetAddress,
  amount,
  action
) => {
  try {
    const accountData = await getUserAccountData(userAddress);
    const assetPrice = await getAssetPrice(assetAddress);
    const amountInUSD = parseFloat(amount) * assetPrice;

    let newCollateral = accountData.totalCollateralETH;
    let newDebt = accountData.totalDebtETH;

    switch (action) {
      case 'supply':
        newCollateral += amountInUSD;
        break;
      case 'withdraw':
        newCollateral -= amountInUSD;
        break;
      case 'borrow':
        newDebt += amountInUSD;
        break;
      case 'repay':
        newDebt -= amountInUSD;
        break;
    }

    if (newDebt === 0) return Infinity;

    const newHealthFactor =
      (newCollateral * accountData.currentLiquidationThreshold) / newDebt;

    return newHealthFactor;
  } catch (error) {
    console.error('Error calculating health factor:', error);
    throw error;
  }
};

/**
 * Check if token needs approval
 * @param {string} tokenAddress - Token address
 * @param {string} userAddress - User address
 * @param {string} amount - Amount to check
 * @param {number} decimals - Token decimals
 * @returns {Promise<boolean>} Whether approval is needed
 */
export const needsApproval = async (tokenAddress, userAddress, amount, decimals) => {
  try {
    const amountInWei = parseUnits(amount, decimals);
    const allowance = await getAllowance(
      tokenAddress,
      userAddress,
      CONTRACT_ADDRESSES.LENDING_POOL
    );

    return BigInt(allowance) < amountInWei;
  } catch (error) {
    console.error('Error checking approval:', error);
    throw error;
  }
};

/**
 * Approve token for lending pool
 * @param {string} tokenAddress - Token address
 * @param {string} amount - Amount to approve
 * @param {number} decimals - Token decimals
 * @returns {Promise<object>} Transaction receipt
 */
export const approveTokenForLending = async (tokenAddress, amount, decimals) => {
  try {
    const amountInWei = parseUnits(amount, decimals);
    const receipt = await approveToken(
      tokenAddress,
      CONTRACT_ADDRESSES.LENDING_POOL,
      amountInWei
    );

    return receipt;
  } catch (error) {
    console.error('Error approving token:', error);
    throw error;
  }
};

export default {
  getLendingPoolContract,
  getTokenContract,
  getUserAccountData,
  getReserveData,
  getATokenBalance,
  getDebtTokenBalance,
  deposit,
  withdraw,
  borrow,
  repay,
  getUserPositions,
  getAssetPrice,
  calculateHealthFactorAfterAction,
  needsApproval,
  approveTokenForLending,
};