import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading component with different variants
 */
const Loading = ({ 
  size = 'md', 
  text = null, 
  fullScreen = false,
  overlay = false,
  variant = 'spinner' // 'spinner', 'dots', 'pulse', 'skeleton'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Spinner Variant
  const SpinnerVariant = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 
        className={`${sizeClasses[size]} text-blue-500 animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );

  // Dots Variant
  const DotsVariant = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {text && (
        <p className="text-sm text-gray-400">{text}</p>
      )}
    </div>
  );

  // Pulse Variant
  const PulseVariant = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-ping absolute`} />
        <div className={`${sizeClasses[size]} bg-blue-600 rounded-full relative`} />
      </div>
      {text && (
        <p className="text-sm text-gray-400">{text}</p>
      )}
    </div>
  );

  // Skeleton Variant (for inline loading)
  const SkeletonVariant = () => (
    <div className="w-full space-y-3">
      <div className="h-4 bg-gray-700 rounded animate-pulse" />
      <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-gray-700 rounded animate-pulse w-4/6" />
    </div>
  );

  // Select variant
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'skeleton':
        return <SkeletonVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-950 bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
        {renderVariant()}
      </div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center rounded-lg z-40">
        {renderVariant()}
      </div>
    );
  }

  // Default inline loading
  return (
    <div className="flex items-center justify-center p-8">
      {renderVariant()}
    </div>
  );
};

/**
 * Card Loading Skeleton
 */
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-20" />
                <div className="h-3 bg-gray-700 rounded w-24" />
              </div>
            </div>
            <div className="h-8 bg-gray-700 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-32" />
            <div className="h-6 bg-gray-700 rounded w-24" />
          </div>
          <div className="mt-4 h-10 bg-gray-700 rounded" />
        </div>
      ))}
    </>
  );
};

/**
 * Table Loading Skeleton
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="h-5 bg-gray-700 rounded w-32 animate-pulse" />
      </div>
      <div className="divide-y divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="h-4 bg-gray-700 rounded flex-1 animate-pulse"
                style={{ animationDelay: `${colIndex * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Button Loading State
 */
export const ButtonLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
};

/**
 * Page Loading (with logo)
 */
export const PageLoading = ({ text = 'Loading DeFi Lending...' }) => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-4xl font-bold text-white">D</span>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold text-white">{text}</h2>
        </div>
        <div className="flex space-x-2 justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

/**
 * Transaction Loading
 */
export const TransactionLoading = ({ 
  status = 'pending', 
  message = 'Processing transaction...' 
}) => {
  const statusConfig = {
    pending: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-900',
      borderColor: 'border-blue-700',
    },
    success: {
      color: 'text-green-400',
      bgColor: 'bg-green-900',
      borderColor: 'border-green-700',
    },
    error: {
      color: 'text-red-400',
      bgColor: 'bg-red-900',
      borderColor: 'border-red-700',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      <div className="flex items-center space-x-3">
        {status === 'pending' && (
          <Loader2 className={`w-5 h-5 ${config.color} animate-spin`} />
        )}
        <div>
          <div className={`text-sm font-medium ${config.color}`}>
            {status === 'pending' ? 'Transaction Pending' : 
             status === 'success' ? 'Transaction Successful' : 
             'Transaction Failed'}
          </div>
          <div className="text-xs text-gray-400 mt-1">{message}</div>
        </div>
      </div>
    </div>
  );
};

export default Loading;