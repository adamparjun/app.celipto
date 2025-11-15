import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Contract, parseUnits, formatUnits } from 'ethers';
import { useWalletContext } from './WalletContext';
import { 
  LENDING_POOL_ABI, 
  ERC20_ABI, 
  ATOKEN_ABI,
  DEBT_TOKEN_ABI 
} from '@/utils/contracts';
import { CONTRACT_ADDRESSES, SUPPORTED_TOKENS, TX_TYPES, TX_STATUS } from '@/utils/constants';
import { approveToken, getAllowance } from '@/utils/web3';

// Create Contract Context
const ContractContext = createContext(undefined);

// Contract Provider Component
export const ContractProvider = ({ children }) => {
  const { account, signer, provider, isConnected } = useWalletContext();

  // State
  const [supplies, setSupplies] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [totalSupplied, setTotalSupplied] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [healthFactor, setHealthFactor] = useState(Infinity);
  const [availableToBorrow, setAvailableToBorrow] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get lending pool contract
   */
  const getLendingPoolContract = useCallback(() => {
    if (!signer) return null;
    return new Contract(CONTRACT_ADDRESSES.LENDING_POOL, LENDING_POOL_ABI, signer);
  }, [signer]);

  /**
   * Get ERC20 token contract
   */
  const getTokenContract = useCallback((tokenAddress) => {
    if (!signer) return null;
    return new Contract(tokenAddress, ERC20_ABI, signer);
  }, [signer]);

  /**
   * Add transaction to history
   */
  const addTransaction = useCallback((tx) => {
    const transaction = {
      ...tx,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: TX_STATUS.PENDING,
    };
    setTransactions(prev => [transaction, ...prev]);
    return transaction.id;
  }, []);

  /**
   * Update transaction status
   */
  const updateTransactionStatus = useCallback((txId, status, hash = null) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === txId 
          ? { ...tx, status, hash, updatedAt: new Date().toISOString() }
          : tx
      )
    );
  }, []);

  /**
   * Check and approve token if needed
   */
  const checkAndApprove = useCallback(async (tokenAddress, amount, decimals = 18) => {
    if (!account) throw new Error('Wallet not connected');

    try {
      const spender = CONTRACT_ADDRESSES.LENDING_POOL;
      const amountInWei = parseUnits(amount.toString(), decimals);
      
      // Check current allowance
      const currentAllowance = await getAllowance(tokenAddress, account, spender);
      
      // If allowance is sufficient, no need to approve
      if (BigInt(currentAllowance) >= amountInWei) {
        return true;
      }

      // Request approval
      console.log('Requesting token approval...');
      const txId = addTransaction({
        type: TX_TYPES.APPROVE,
        token: tokenAddress,
        amount: amount.toString(),
      });

      const receipt = await approveToken(tokenAddress, spender, amountInWei);
      
      updateTransactionStatus(txId, TX_STATUS.CONFIRMED, receipt.hash);
      console.log('Token approved:', receipt.hash);
      
      return true;
    } catch (err) {
      console.error('Error approving token:', err);
      throw err;
    }
  }, [account, addTransaction, updateTransactionStatus]);

  /**
   * Supply assets
   */
  const supply = useCallback(async (token, amount) => {
    if (!account || !signer) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      const amountInWei = parseUnits(amount.toString(), token.decimals);
      
      // Step 1: Approve token if needed
      if (!token.isNative) {
        await checkAndApprove(token.address, amount, token.decimals);
      }

      // Step 2: Supply to lending pool
      const lendingPool = getLendingPoolContract();
      if (!lendingPool) throw new Error('Contract not initialized');

      const txId = addTransaction({
        type: TX_TYPES.SUPPLY,
        token: token.symbol,
        amount: amount.toString(),
      });

      console.log('Supplying', amount, token.symbol);
      
      const tx = await lendingPool.deposit(
        token.address,
        amountInWei,
        account,
        0 // referral code
      );

      console.log('Transaction sent:', tx.hash);
      updateTransactionStatus(txId, TX_STATUS.PENDING, tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);
      
      updateTransactionStatus(txId, TX_STATUS.CONFIRMED, receipt.hash);

      // Update supplies
      const newSupply = {
        id: Date.now(),
        token,
        amount: parseFloat(amount),
        apy: token.supplyAPY,
        timestamp: new Date().toISOString(),
        txHash: receipt.hash,
      };

      setSupplies(prev => [...prev, newSupply]);
      setTotalSupplied(prev => prev + (parseFloat(amount) * token.price));

      // Refresh user data
      await loadUserAccountData();

      return receipt;
    } catch (err) {
      console.error('Error supplying:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [account, signer, checkAndApprove, getLendingPoolContract, addTransaction, updateTransactionStatus]);

  /**
   * Withdraw assets
   */
  const withdraw = useCallback(async (supplyId, amount = null) => {
    if (!account || !signer) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      const supply = supplies.find(s => s.id === supplyId);
      if (!supply) throw new Error('Supply not found');

      const withdrawAmount = amount || supply.amount;
      const amountInWei = parseUnits(withdrawAmount.toString(), supply.token.decimals);

      const lendingPool = getLendingPoolContract();
      if (!lendingPool) throw new Error('Contract not initialized');

      const txId = addTransaction({
        type: TX_TYPES.WITHDRAW,
        token: supply.token.symbol,
        amount: withdrawAmount.toString(),
      });

      console.log('Withdrawing', withdrawAmount, supply.token.symbol);

      const tx = await lendingPool.withdraw(
        supply.token.address,
        amountInWei,
        account
      );

      console.log('Transaction sent:', tx.hash);
      updateTransactionStatus(txId, TX_STATUS.PENDING, tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);
      
      updateTransactionStatus(txId, TX_STATUS.CONFIRMED, receipt.hash);

      // Update supplies
      if (amount && amount < supply.amount) {
        // Partial withdrawal
        setSupplies(prev => 
          prev.map(s => 
            s.id === supplyId 
              ? { ...s, amount: s.amount - parseFloat(amount) }
              : s
          )
        );
        setTotalSupplied(prev => prev - (parseFloat(amount) * supply.token.price));
      } else {
        // Full withdrawal
        setSupplies(prev => prev.filter(s => s.id !== supplyId));
        setTotalSupplied(prev => prev - (supply.amount * supply.token.price));
      }

      // Refresh user data
      await loadUserAccountData();

      return receipt;
    } catch (err) {
      console.error('Error withdrawing:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [account, signer, supplies, getLendingPoolContract, addTransaction, updateTransactionStatus]);

  /**
   * Borrow assets
   */
  const borrow = useCallback(async (token, amount) => {
    if (!account || !signer) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      const amountInWei = parseUnits(amount.toString(), token.decimals);

      const lendingPool = getLendingPoolContract();
      if (!lendingPool) throw new Error('Contract not initialized');

      const txId = addTransaction({
        type: TX_TYPES.BORROW,
        token: token.symbol,
        amount: amount.toString(),
      });

      console.log('Borrowing', amount, token.symbol);

      const tx = await lendingPool.borrow(
        token.address,
        amountInWei,
        2, // variable interest rate mode
        0, // referral code
        account
      );

      console.log('Transaction sent:', tx.hash);
      updateTransactionStatus(txId, TX_STATUS.PENDING, tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);
      
      updateTransactionStatus(txId, TX_STATUS.CONFIRMED, receipt.hash);

      // Update borrows
      const newBorrow = {
        id: Date.now(),
        token,
        amount: parseFloat(amount),
        apy: token.borrowAPY,
        timestamp: new Date().toISOString(),
        txHash: receipt.hash,
      };

      setBorrows(prev => [...prev, newBorrow]);
      setTotalBorrowed(prev => prev + (parseFloat(amount) * token.price));

      // Refresh user data
      await loadUserAccountData();

      return receipt;
    } catch (err) {
      console.error('Error borrowing:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [account, signer, getLendingPoolContract, addTransaction, updateTransactionStatus]);

  /**
   * Repay borrowed assets
   */
  const repay = useCallback(async (borrowId, amount = null) => {
    if (!account || !signer) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      const borrowData = borrows.find(b => b.id === borrowId);
      if (!borrowData) throw new Error('Borrow not found');

      const repayAmount = amount || borrowData.amount;
      const amountInWei = parseUnits(repayAmount.toString(), borrowData.token.decimals);

      // Approve token
      await checkAndApprove(borrowData.token.address, repayAmount, borrowData.token.decimals);

      const lendingPool = getLendingPoolContract();
      if (!lendingPool) throw new Error('Contract not initialized');

      const txId = addTransaction({
        type: TX_TYPES.REPAY,
        token: borrowData.token.symbol,
        amount: repayAmount.toString(),
      });

      console.log('Repaying', repayAmount, borrowData.token.symbol);

      const tx = await lendingPool.repay(
        borrowData.token.address,
        amountInWei,
        2, // variable rate mode
        account
      );

      console.log('Transaction sent:', tx.hash);
      updateTransactionStatus(txId, TX_STATUS.PENDING, tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);
      
      updateTransactionStatus(txId, TX_STATUS.CONFIRMED, receipt.hash);

      // Update borrows
      if (amount && amount < borrowData.amount) {
        // Partial repayment
        setBorrows(prev => 
          prev.map(b => 
            b.id === borrowId 
              ? { ...b, amount: b.amount - parseFloat(amount) }
              : b
          )
        );
        setTotalBorrowed(prev => prev - (parseFloat(amount) * borrowData.token.price));
      } else {
        // Full repayment
        setBorrows(prev => prev.filter(b => b.id !== borrowId));
        setTotalBorrowed(prev => prev - (borrowData.amount * borrowData.token.price));
      }

      // Refresh user data
      await loadUserAccountData();

      return receipt;
    } catch (err) {
      console.error('Error repaying:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [account, signer, borrows, checkAndApprove, getLendingPoolContract, addTransaction, updateTransactionStatus]);

  /**
   * Load user account data from lending pool
   */
  const loadUserAccountData = useCallback(async () => {
    if (!account || !provider) return;

    try {
      const lendingPool = new Contract(
        CONTRACT_ADDRESSES.LENDING_POOL, 
        LENDING_POOL_ABI, 
        provider
      );

      const userData = await lendingPool.getUserAccountData(account);
      
      // userData returns: totalCollateralETH, totalDebtETH, availableBorrowsETH, 
      // currentLiquidationThreshold, ltv, healthFactor
      
      const collateralETH = parseFloat(formatUnits(userData[0], 18));
      const debtETH = parseFloat(formatUnits(userData[1], 18));
      const availableBorrowETH = parseFloat(formatUnits(userData[2], 18));
      const hf = parseFloat(formatUnits(userData[5], 18));

      setTotalSupplied(collateralETH);
      setTotalBorrowed(debtETH);
      setAvailableToBorrow(availableBorrowETH);
      setHealthFactor(hf);

      console.log('User account data loaded:', {
        collateral: collateralETH,
        debt: debtETH,
        availableToBorrow: availableBorrowETH,
        healthFactor: hf,
      });
    } catch (err) {
      console.error('Error loading user account data:', err);
    }
  }, [account, provider]);

  /**
   * Load user data on connect
   */
  useEffect(() => {
    if (isConnected && account) {
      loadUserAccountData();
    }
  }, [isConnected, account, loadUserAccountData]);

  // Context value
  const value = {
    // State
    supplies,
    borrows,
    totalSupplied,
    totalBorrowed,
    healthFactor,
    availableToBorrow,
    transactions,
    isLoading,
    error,

    // Methods
    supply,
    withdraw,
    borrow,
    repay,
    loadUserAccountData,
    getLendingPoolContract,
    getTokenContract,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom hook to use Contract Context
export const useContractContext = () => {
  const context = useContext(ContractContext);
  
  if (context === undefined) {
    throw new Error('useContractContext must be used within a ContractProvider');
  }
  
  return context;
};

export default ContractContext;