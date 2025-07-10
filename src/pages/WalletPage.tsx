import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Menu,
  Shield,
  DollarSign
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { useInterval } from '../hooks/useInterval';
import TokenBalanceDisplay from '../components/TokenBalanceDisplay';
import TransactionHistory from '../components/TransactionHistory';
import WalletActions from '../components/WalletActions';

// Base Network Configuration
const BASE_NETWORK = {
  chainId: '0x2105', // 8453 in hex
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

// DRONE Token Contract Address on Base (placeholder until deployed)
const DRONE_TOKEN_ADDRESS = import.meta.env.VITE_DRONE_TOKEN_ADDRESS || '0x1234567890123456789012345678901234567890';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [droneTokenBalance, setDroneTokenBalance] = useState<number>(0);
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [walletError, setWalletError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date>(new Date());

  // Check if MetaMask is installed on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMetaMaskInstalled(!!window.ethereum);
    }
  }, []);

  // Real-time wallet balance updates
  useInterval(() => {
    if (walletAddress && isCorrectNetwork) {
      updateBalances(walletAddress);
    }
  }, 5000); // Refresh every 5 seconds

  // Load wallet data on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            
            // Get network info
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const isBase = chainId === BASE_NETWORK.chainId;
            setIsCorrectNetwork(isBase);
            
            if (isBase) {
              setCurrentNetwork('Base');
              // Get ETH balance
              const provider = new ethers.BrowserProvider(window.ethereum);
              const balance = await provider.getBalance(accounts[0]);
              setWalletBalance(ethers.formatEther(balance));
            } else {
              setCurrentNetwork(getNetworkName(chainId));
            }
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };
    
    checkWalletConnection();
    
    // Setup event listeners for wallet changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      // Cleanup event listeners
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const getNetworkName = (chainId: string): string => {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x2105': 'Base',
      '0x89': 'Polygon',
      '0xa': 'Optimism',
      '0xa4b1': 'Arbitrum One'
    };
    
    return networks[chainId] || 'Unknown Network';
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      disconnectWallet();
    } else {
      // Account changed
      setWalletAddress(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    const isBase = chainId === BASE_NETWORK.chainId;
    setIsCorrectNetwork(isBase);
    
    if (isBase) {
      setCurrentNetwork('Base');
      updateBalances(walletAddress);
    } else {
      setCurrentNetwork(getNetworkName(chainId));
      // Reset DRONE balance as it's only available on Base
      setDroneTokenBalance(0);
    }
  };

  const updateBalances = async (address: string) => {
    if (!address || !isCorrectNetwork) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get ETH balance
      const balance = await provider.getBalance(address);
      setWalletBalance(ethers.formatEther(balance));
      setLastBalanceUpdate(new Date());
      
      // Trigger a refresh of the token balance component
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update balances:', error);
    }
  };

  const handleTokenBalanceUpdate = useCallback((balance: number) => {
    setDroneTokenBalance(balance);
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setWalletError('Please install MetaMask or another Web3 wallet to continue.');
      return;
    }
    
    try {
      setIsConnecting(true);
      setWalletError(''); // Clear any previous errors
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        
        // Get network info
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isBase = chainId === BASE_NETWORK.chainId;
        setIsCorrectNetwork(isBase);
        
        if (isBase) {
          setCurrentNetwork('Base');
          // Get ETH balance
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(accounts[0]);
          setWalletBalance(ethers.formatEther(balance));
          setLastBalanceUpdate(new Date());
        } else {
          setCurrentNetwork(getNetworkName(chainId));
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Handle specific error codes
      if (error.code === 4001) {
        // User rejected the request
        setWalletError('Wallet connection cancelled by user.');
      } else if (error.code === -32002) {
        // Request already pending
        setWalletError('Wallet connection request already pending. Please check your wallet.');
      } else if (error.code === 4100) {
        // Unauthorized
        setWalletError('Wallet access unauthorized. Please unlock your wallet.');
      } else if (error.code === 4200) {
        // Unsupported method
        setWalletError('Wallet does not support this connection method.');
      } else {
        // Generic error
        setWalletError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setWalletBalance('0');
    setDroneTokenBalance(0);
    setCurrentNetwork('');
    setIsCorrectNetwork(false);
    setWalletError(''); // Clear any wallet errors
  };

  const switchToBaseNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      setWalletError('Please install MetaMask or another Web3 wallet to continue.');
      return;
    }
    
    try {
      setIsSwitchingNetwork(true);
      setWalletError(''); // Clear any previous errors
      
      // Try to switch to Base network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the Base network to MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_NETWORK],
          });
        } catch (addError: any) {
          console.error('Failed to add Base network:', addError);
          if (addError.code === 4001) {
            setWalletError('Network addition cancelled by user.');
          } else {
            setWalletError('Failed to add Base network. Please try again.');
          }
        }
      } else if (switchError.code === 4001) {
        setWalletError('Network switch cancelled by user.');
      } else {
        console.error('Failed to switch to Base network:', switchError);
        setWalletError('Failed to switch to Base network. Please try again.');
      }
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Get real ETH balance or fallback to calculated
  const displayEthBalance = (): string => {
    if (walletBalance && parseFloat(walletBalance) > 0) {
      return parseFloat(walletBalance).toFixed(4);
    }
    return '0.0000';
  };

  return (
    <div className="min-h-screen bg-stealth flex">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-[#0a0a0f] border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Wallet</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Wallet</h1>
                <p className="text-gray-400">Manage your crypto assets and transactions</p>
              </div>
              <div className="hidden lg:block">
                <CyberButton onClick={() => updateBalances(walletAddress)} disabled={!walletAddress || !isCorrectNetwork}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Balances
                </CyberButton>
              </div>
            </div>

            {/* Wallet Connection Status */}
            <HudPanel className="p-6 mb-8">
              {walletError && (
                <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                      <p className="text-sm text-yellow-300">{walletError}</p>
                    </div>
                    <button
                      onClick={() => setWalletError('')}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {!isMetaMaskInstalled && !walletAddress && (
                <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                    <div>
                      <p className="text-sm text-yellow-300 font-medium">MetaMask not detected</p>
                      <p className="text-xs text-yellow-200">
                        Please install <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="underline">MetaMask</a> or another Web3 wallet to connect your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!walletAddress ? (
                <div className="text-center py-8">
                  <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Connect your wallet to view your balances, receive DRONE tokens, and track your transactions.
                  </p>
                  <CyberButton 
                    onClick={connectWallet} 
                    className="mx-auto"
                    disabled={isConnecting || !isMetaMaskInstalled}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </>
                    )}
                  </CyberButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Wallet Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Address</label>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2 bg-green-400"></div>
                          <span className="text-xs text-green-400">Approved</span>
                          <div className="bg-[#0d0d14] p-2 rounded flex-1 font-mono text-sm truncate">{walletAddress}</div>
                          <button
                            onClick={() => copyToClipboard(walletAddress)}
                            className="ml-2 p-2 bg-[#0d0d14] rounded hover:bg-[#161620] transition-colors"
                            title="Copy to clipboard"
                          >
                            {copySuccess ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-400 hover:text-plasma" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Network</label>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${isCorrectNetwork ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                            <span>{currentNetwork || 'Not Connected'}</span>
                          </div>
                          {!isCorrectNetwork && (
                            <CyberButton 
                              onClick={switchToBaseNetwork} 
                              className="text-xs py-1 px-3"
                              disabled={isSwitchingNetwork}
                            >
                              {isSwitchingNetwork ? (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Switching...
                                </>
                              ) : (
                                'Switch to Base'
                              )}
                            </CyberButton>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-800">
                        <CyberButton 
                          onClick={disconnectWallet} 
                          variant="red" 
                          className="w-full"
                        >
                          Disconnect Wallet
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Token Balances</h3>
                    <div className="space-y-4">
                      <TokenBalanceDisplay 
                        walletAddress={walletAddress}
                        tokenAddress={DRONE_TOKEN_ADDRESS}
                        isCorrectNetwork={isCorrectNetwork}
                        refreshTrigger={refreshTrigger}
                        onBalanceUpdate={handleTokenBalanceUpdate}
                      />
                      
                      <div className="bg-[#0d0d14] p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="font-medium">Ethereum</span>
                          </div>
                          <a 
                            href={`https://basescan.org/address/${walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-plasma"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-2xl font-bold">{displayEthBalance()} ETH</p>
                        <p className="text-xs text-gray-400">
                          Last updated: {lastBalanceUpdate.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <WalletActions 
                      walletAddress={walletAddress}
                      isCorrectNetwork={isCorrectNetwork}
                    />
                  </div>
                </div>
              )}
            </HudPanel>

            {/* Transaction History */}
            {walletAddress && (
              <TransactionHistory 
                walletAddress={walletAddress}
                userId={user?.id}
                isCorrectNetwork={isCorrectNetwork}
                onRefresh={() => updateBalances(walletAddress)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;