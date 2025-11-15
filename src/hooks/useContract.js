import { useContractContext } from '@/contexts/ContractContext';

/**
 * Custom hook to access contract functionality
 * This is a convenience wrapper around ContractContext
 */
export const useContract = () => {
  const context = useContractContext();

  if (!context) {
    throw new Error('useContract must be used within ContractProvider');
  }

  return context;
};

export default useContract;