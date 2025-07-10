import React, { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

// DRONE Token ABI (minimal for balanceOf)
const DRONE_TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

interface TokenBalanceDisplayProps {
  walletAddress: string;
  tokenAddress: string;
  isCorrectNetwork: boolean;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
  onBalanceUpdate?: (balance: number) => void; // Callback to update parent state
}

const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({
  walletAddress,
  tokenAddress,
  isCorrectNetwork,
  refreshTrigger = 0,
  onBalanceUpdate
}) => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  
  // Refs for cleanup and preventing memory leaks
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  
  // Check if token address is a placeholder
  const isPlaceholderAddress = (address: string): boolean => {
    // Check for common placeholder patterns
    const placeholderPatterns = [
      /^0x1234567890123456789012345678901234567890$/i,
      /^0x0+$/,
      /^0x1+$/,
      /^0xdeadbeef/i,
      /^0x[0-9a-f]{40}$/i // This will match, but we'll check if it's a known placeholder
    ];
    
    const knownPlaceholders = [
      '0x1234567890123456789012345678901234567890',
      '0x0000000000000000000000000000000000000000',
      '0x1111111111111111111111111111111111111111'
    ];
    
    return knownPlaceholders.includes(address.toLowerCase());
  };
  
  // Fetch token balance
  const fetchBalance = async () => {
    if (!walletAddress || !isCorrectNetwork || !window.ethereum) {
      return;
    }
    
    // Check if using placeholder address
    if (isPlaceholderAddress(tokenAddress)) {
      setError('DRONE token contract not yet deployed. Balance will be available once the token is launched.');
      setBalance(0);
      if (onBalanceUpdate) {
        onBalanceUpdate(0);
      }
      return;
    }
    
    // Don't show loading state for quick refreshes
    const loadingTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
    }, 500);
    
    try {
      setError(null);
      
      // Check if the contract address is valid
      if (!ethers.isAddress(tokenAddress)) {
        throw new Error('Invalid token contract address');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if contract exists by getting code at address
      const code = await provider.getCode(tokenAddress);
      if (code === '0x') {
        throw new Error('No contract found at token address');
      }
      
      // Create contract instance
      const contract = new ethers.Contract(
        tokenAddress,
        DRONE_TOKEN_ABI,
        provider
      );
      
      // Call balanceOf with timeout
      const balancePromise = contract.balanceOf(walletAddress);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Contract call timeout')), 10000)
      );
      
      const rawBalance = await Promise.race([balancePromise, timeoutPromise]);
      
      // Convert from wei to token units (assuming 18 decimals)
      const formattedBalance = Number(ethers.formatUnits(rawBalance, 18));
      
      if (isMountedRef.current) {
        setBalance(formattedBalance);
        setLastUpdated(new Date());
        
        // Call the callback if provided
        if (onBalanceUpdate) {
          onBalanceUpdate(formattedBalance);
        }
      }
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
      
      if (isMountedRef.current) {
        // Set user-friendly error message
        if (error.message.includes('timeout')) {
          setError('Request timed out. Network may be congested.');
        } else if (error.message.includes('No contract found')) {
          setError('DRONE token contract not yet deployed. Balance will be available once the token is launched.');
        } else if (error.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection.');
        } else {
          setError('Failed to fetch token balance.');
        }
      }
    } finally {
      clearTimeout(loadingTimer);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };
  
  // Set up auto-refresh
  useEffect(() => {
    const setupAutoRefresh = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (autoRefreshEnabled && walletAddress && isCorrectNetwork && !isPlaceholderAddress(tokenAddress)) {
        timerRef.current = setInterval(() => {
          if (document.visibilityState === 'visible') {
            fetchBalance();
          }
        }, 15000); // Refresh every 15 seconds
      }
    };
    
    setupAutoRefresh();
    
    // Visibility change listener to pause refreshing when tab is not visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRefreshEnabled) {
        fetchBalance();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      isMountedRef.current = false;
    };
  }, [walletAddress, tokenAddress, isCorrectNetwork, autoRefreshEnabled]);
  
  // Fetch balance when props change
  useEffect(() => {
    if (walletAddress && isCorrectNetwork) {
      fetchBalance();
    } else {
      // Reset state when wallet is disconnected or network is wrong
      setBalance(0);
      setError(null);
    }
  }, [walletAddress, tokenAddress, isCorrectNetwork, refreshTrigger]);
  
  // Format balance for display
  const formattedBalance = balance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  // Calculate EUR value (assuming 1 DRONE = €1.5)
  const eurValue = (balance * 1.5).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return (
    <div className="bg-[#0d0d14] p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-plasma mr-2" />
          <span className="font-medium">DRONE Token</span>
        </div>
        <button 
          onClick={fetchBalance}
          disabled={isLoading || !walletAddress || !isCorrectNetwork || isPlaceholderAddress(tokenAddress)}
          className="text-gray-400 hover:text-plasma disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {error ? (
        <div className="mt-2 mb-3 p-2 bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded text-xs text-yellow-300 flex items-start">
          <AlertCircle className="w-3 h-3 text-yellow-400 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
      
      <div className="flex justify-between items-end">
        <div>
          <p className={`text-2xl font-bold text-plasma ${isLoading ? 'opacity-50' : ''}`}>
            {isLoading ? <span className="animate-pulse">Loading...</span> : formattedBalance}
          </p>
          <p className="text-xs text-gray-400">≈ €{eurValue}</p>
        </div>
        <div className="px-2 py-1 bg-[#161620] rounded text-xs">
          Security Token
        </div>
      </div>
      
      <div className="mt-2 text-right">
        <p className="text-xs text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default TokenBalanceDisplay;