import { useWalletContext } from '@/contexts/WalletContext';

/**
 * Custom hook to access wallet functionality
 * This is a convenience wrapper around WalletContext
 */
export const useWallet = () => {
  const context = useWalletContext();

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
};

export default useWallet;