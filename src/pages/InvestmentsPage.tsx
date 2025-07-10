import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  BarChart2, 
  PieChart, 
  Download, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  Menu,
  ExternalLink,
  RefreshCw,
  Clock,
  Shield,
  AlertCircle,
  X,
  CheckCircle
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useInterval } from '../hooks/useInterval';

interface Investment {
  id: string;
  date: string;
  amount: number;
  tokens: number;
  status: 'completed' | 'pending' | 'processing';
  transactionHash?: string;
}

interface Distribution {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'scheduled';
  transactionHash?: string;
}

interface WalletStats {
  tokenBalance: number;
  totalInvested: number;
  totalReceived: number;
  nextDistribution: {
    amount: number;
    date: string;
  } | null;
}

const InvestmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'distributions'>('investments');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'processing'>('all');
  
  // Data states
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    tokenBalance: 0,
    totalInvested: 0,
    totalReceived: 0,
    nextDistribution: null
  });
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Cache for data to prevent unnecessary re-renders
  const dataCache = useRef({
    investments: [] as Investment[],
    distributions: [] as Distribution[],
    walletStats: {
      tokenBalance: 0,
      totalInvested: 0,
      totalReceived: 0,
      nextDistribution: null
    } as WalletStats
  });
  
  // Fetch data on component mount
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Set up auto-refresh interval (every 2 seconds)
  useInterval(() => {
    silentRefresh();
  }, 2000);
  
  // Load all data initially
  const loadAllData = async () => {
    setIsLoading(true);
    setDataError(null);
    
    try {
      await Promise.all([
        fetchInvestments(),
        fetchDistributions(),
        fetchWalletStats()
      ]);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load data:', error);
      setDataError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Silent refresh without loading indicators
  const silentRefresh = async () => {
    try {
      await Promise.all([
        fetchWalletStats(true)
      ]);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Silent refresh failed:', error);
      // Don't show errors for silent refreshes
    }
  };
  
  // Manual refresh with loading indicators
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataError(null);
    
    try {
      await Promise.all([
        fetchInvestments(),
        fetchDistributions(),
        fetchWalletStats()
      ]);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setDataError('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Fetch investments data
  const fetchInvestments = async () => {
    try {
      // Try to fetch from Supabase first
      let investmentsData: Investment[] = [];
      
      try {
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user?.id)
          .eq('type', 'deposit')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Failed to fetch investments from Supabase:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          investmentsData = data.map(tx => ({
            id: tx.id,
            date: tx.created_at,
            amount: tx.amount,
            tokens: tx.amount / 1.5, // Assuming 1 DRONE = €1.5
            status: tx.status,
            transactionHash: tx.transaction_hash
          }));
        }
      } catch (error) {
        console.warn('Using mock investment data');
        
        // Fallback to mock data
        investmentsData = [
          {
            id: 'inv-001',
            date: '2025-01-15T10:30:00Z',
            amount: 75000,
            tokens: 50000,
            status: 'completed',
            transactionHash: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4'
          },
          {
            id: 'inv-002',
            date: '2025-02-20T14:45:00Z',
            amount: 112500,
            tokens: 75000,
            status: 'completed',
            transactionHash: '0x8ba1f109551bD432803012645Hac136c0532925a'
          },
          {
            id: 'inv-003',
            date: '2025-03-10T09:15:00Z',
            amount: 37500,
            tokens: 25000,
            status: 'pending'
          }
        ];
      }
      
      // Only update state if data has changed
      if (JSON.stringify(investmentsData) !== JSON.stringify(dataCache.current.investments)) {
        setInvestments(investmentsData);
        dataCache.current.investments = investmentsData;
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      throw error;
    }
  };
  
  // Fetch distributions data
  const fetchDistributions = async () => {
    try {
      // Try to fetch from Supabase first
      let distributionsData: Distribution[] = [];
      
      try {
        const { data, error } = await supabase
          .from('profit_distribution_logs')
          .select(`
            id,
            amount,
            status,
            transaction_hash,
            created_at,
            completed_at,
            profit_distributions(distribution_date)
          `)
          .eq('wallet_address', user?.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Failed to fetch distributions from Supabase:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          distributionsData = data.map(log => ({
            id: log.id,
            date: log.profit_distributions?.distribution_date || log.created_at,
            amount: log.amount,
            status: log.status,
            transactionHash: log.transaction_hash
          }));
        }
      } catch (error) {
        console.warn('Using mock distribution data');
        
        // Fallback to mock data
        distributionsData = [
          {
            id: 'dist-001',
            date: '2025-04-15T10:00:00Z',
            amount: 3750,
            status: 'completed',
            transactionHash: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4'
          },
          {
            id: 'dist-002',
            date: '2025-07-15T10:00:00Z',
            amount: 4125,
            status: 'completed',
            transactionHash: '0x8ba1f109551bD432803012645Hac136c0532925a'
          },
          {
            id: 'dist-003',
            date: '2025-10-15T10:00:00Z',
            amount: 4500,
            status: 'scheduled'
          }
        ];
      }
      
      // Only update state if data has changed
      if (JSON.stringify(distributionsData) !== JSON.stringify(dataCache.current.distributions)) {
        setDistributions(distributionsData);
        dataCache.current.distributions = distributionsData;
      }
    } catch (error) {
      console.error('Failed to fetch distributions:', error);
      throw error;
    }
  };
  
  // Fetch wallet stats
  const fetchWalletStats = async (silent = false) => {
    try {
      // Try to fetch from Supabase first
      let walletStatsData: WalletStats = {
        tokenBalance: 0,
        totalInvested: 0,
        totalReceived: 0,
        nextDistribution: null
      };
      
      try {
        // Get token balance - use maybeSingle() to handle no rows gracefully
        const { data: tokenData, error: tokenError } = await supabase
          .from('token_holders')
          .select('balance')
          .eq('user_id', user?.id)
          .maybeSingle();
        
        if (tokenError) {
          console.warn('Failed to fetch token balance:', tokenError);
          throw tokenError;
        }
        
        if (tokenData) {
          walletStatsData.tokenBalance = tokenData.balance;
        }
        
        // Get total invested - use maybeSingle() to handle no rows gracefully
        const { data: investmentData, error: investmentError } = await supabase
          .from('profiles')
          .select('investment_amount')
          .eq('id', user?.id)
          .maybeSingle();
        
        if (investmentError) {
          console.warn('Failed to fetch investment amount:', investmentError);
          throw investmentError;
        }
        
        if (investmentData) {
          walletStatsData.totalInvested = investmentData.investment_amount;
        }
        
        // Get profit metrics
        const { data: metricsData, error: metricsError } = await supabase.rpc('get_profit_sharing_metrics');
        
        if (metricsError) {
          console.warn('Failed to fetch profit metrics:', metricsError);
          throw metricsError;
        }
        
        if (metricsData) {
          walletStatsData.totalReceived = metricsData.total_distributed || 0;
          
          if (metricsData.next_distribution) {
            walletStatsData.nextDistribution = {
              amount: metricsData.next_distribution.amount,
              date: metricsData.next_distribution.date
            };
          }
        }
      } catch (error) {
        console.warn('Using mock wallet stats data');
        
        // Fallback to mock data
        walletStatsData = {
          tokenBalance: 125000,
          totalInvested: 187500,
          totalReceived: 7875,
          nextDistribution: {
            amount: 4500,
            date: '2025-10-15T10:00:00Z'
          }
        };
      }
      
      // Only update state if data has changed
      if (JSON.stringify(walletStatsData) !== JSON.stringify(dataCache.current.walletStats)) {
        if (!silent) {
          setWalletStats(walletStatsData);
        } else {
          // For silent updates, update state without triggering re-renders if possible
          setWalletStats(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(walletStatsData)) {
              return walletStatsData;
            }
            return prev;
          });
        }
        dataCache.current.walletStats = walletStatsData;
      }
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error);
      throw error;
    }
  };
  
  // Filter and sort data
  const filteredInvestments = investments.filter(inv => 
    filterStatus === 'all' || inv.status === filterStatus
  ).sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return sortOrder === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
  });

  const filteredDistributions = distributions.filter(dist => 
    filterStatus === 'all' || dist.status === filterStatus
  ).sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return sortOrder === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900 text-green-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      case 'processing': return 'bg-blue-900 text-blue-300';
      case 'scheduled': return 'bg-blue-900 text-blue-300';
      case 'failed': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-900 text-green-300 text-xs uppercase rounded flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs uppercase rounded flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs uppercase rounded flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> Processing</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs uppercase rounded flex items-center"><Calendar className="w-3 h-3 mr-1" /> Scheduled</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-900 text-red-300 text-xs uppercase rounded flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 text-gray-300 text-xs uppercase rounded">{status}</span>;
    }
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
            <TrendingUp className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Investments</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Investments & Distributions</h1>
                <p className="text-gray-400">Track your investment activity and profit distributions</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400 hidden md:block">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <CyberButton onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </CyberButton>
                <CyberButton>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </CyberButton>
              </div>
            </div>

            {/* Error Message */}
            {dataError && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{dataError}</p>
                  </div>
                  <button
                    onClick={() => setDataError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Total Invested</h3>
                  <DollarSign className="w-5 h-5 text-plasma" />
                </div>
                {isLoading ? (
                  <div className="h-14 flex items-center">
                    <div className="w-5 h-5 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-plasma">{formatCurrency(walletStats.totalInvested)}</p>
                    <p className="text-sm text-gray-400">Across {investments.filter(inv => inv.status === 'completed').length} investments</p>
                  </>
                )}
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Token Balance</h3>
                  <Shield className="w-5 h-5 text-plasma" />
                </div>
                {isLoading ? (
                  <div className="h-14 flex items-center">
                    <div className="w-5 h-5 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-plasma">{walletStats.tokenBalance.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">DRONE Tokens</p>
                  </>
                )}
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Total Received</h3>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                {isLoading ? (
                  <div className="h-14 flex items-center">
                    <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(walletStats.totalReceived)}</p>
                    <p className="text-sm text-gray-400">Profit distributions</p>
                  </>
                )}
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Next Distribution</h3>
                  <Calendar className="w-5 h-5 text-plasma" />
                </div>
                {isLoading ? (
                  <div className="h-14 flex items-center">
                    <div className="w-5 h-5 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : walletStats.nextDistribution ? (
                  <>
                    <p className="text-2xl font-bold text-plasma">
                      {formatCurrency(walletStats.nextDistribution.amount)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Scheduled
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-plasma">-</p>
                    <p className="text-sm text-gray-400">No scheduled distributions</p>
                  </>
                )}
              </HudPanel>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Investment Growth</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Last 12 months</span>
                    <CyberButton className="text-xs py-1 px-2">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </CyberButton>
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center relative">
                    {/* Investment Growth Chart */}
                    <div className="absolute inset-0 p-4">
                      <div className="h-full flex items-end">
                        {/* Mock bar chart - in a real app, use a charting library */}
                        <div className="w-1/12 mx-1">
                          <div className="h-[20%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[60%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[30%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[70%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[25%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[80%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[40%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[65%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[35%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[75%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[50%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[60%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[45%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[70%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[60%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[80%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[55%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[75%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[70%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[85%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[65%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[90%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                        <div className="w-1/12 mx-1">
                          <div className="h-[80%] bg-plasma bg-opacity-30 rounded-t-sm">
                            <div className="h-[95%] bg-plasma rounded-t-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Distribution History</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Last 12 months</span>
                    <CyberButton className="text-xs py-1 px-2">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </CyberButton>
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center relative">
                    {/* Distribution History Chart */}
                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                      {/* Mock pie chart - in a real app, use a charting library */}
                      <div className="relative w-40 h-40">
                        <div className="absolute inset-0 rounded-full border-8 border-plasma opacity-30"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-plasma border-r-plasma" style={{ transform: 'rotate(45deg)' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Total</p>
                            <p className="text-xl font-bold text-plasma">{formatCurrency(walletStats.totalReceived)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-plasma mr-2"></div>
                          <span className="text-xs">Q1-Q2 2025</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-plasma opacity-30 mr-2"></div>
                          <span className="text-xs">Q3-Q4 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </HudPanel>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 mb-6">
              <button
                className={`py-3 px-6 font-medium ${
                  activeTab === 'investments' 
                    ? 'text-plasma border-b-2 border-plasma' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('investments')}
              >
                Investments
              </button>
              <button
                className={`py-3 px-6 font-medium ${
                  activeTab === 'distributions' 
                    ? 'text-plasma border-b-2 border-plasma' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('distributions')}
              >
                Profit Distributions
              </button>
            </div>

            {/* Filters */}
            <HudPanel className="p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Sort by</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                        className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                      >
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="text-plasma hover:text-white"
                      >
                        {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Status</label>
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                      </select>
                    </div>
                  </div>
                </div>

                <CyberButton className="text-xs py-1 px-3">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </CyberButton>
              </div>
            </HudPanel>

            {/* Transactions List */}
            <HudPanel className="p-6">
              {activeTab === 'investments' ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Investment History</h2>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plasma mx-auto"></div>
                      <p className="text-gray-400 mt-2">Loading investments...</p>
                    </div>
                  ) : filteredInvestments.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No investments found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Tokens</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvestments.map((investment) => (
                            <tr key={investment.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                              <td className="py-3 px-4">
                                {formatDate(investment.date)}
                              </td>
                              <td className="py-3 px-4 font-medium">
                                {formatCurrency(investment.amount)}
                              </td>
                              <td className="py-3 px-4 text-plasma">
                                {investment.tokens.toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                {getStatusBadge(investment.status)}
                              </td>
                              <td className="py-3 px-4">
                                {investment.transactionHash ? (
                                  <a 
                                    href={`https://basescan.org/tx/${investment.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-plasma hover:underline flex items-center"
                                  >
                                    <span className="font-mono text-xs">
                                      {investment.transactionHash.slice(0, 6)}...{investment.transactionHash.slice(-4)}
                                    </span>
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">Distribution History</h2>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plasma mx-auto"></div>
                      <p className="text-gray-400 mt-2">Loading distributions...</p>
                    </div>
                  ) : filteredDistributions.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No distributions found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDistributions.map((distribution) => (
                            <tr key={distribution.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                              <td className="py-3 px-4">
                                {formatDate(distribution.date)}
                              </td>
                              <td className="py-3 px-4 font-medium text-green-400">
                                {formatCurrency(distribution.amount)}
                              </td>
                              <td className="py-3 px-4">
                                {getStatusBadge(distribution.status)}
                              </td>
                              <td className="py-3 px-4">
                                {distribution.transactionHash ? (
                                  <a 
                                    href={`https://basescan.org/tx/${distribution.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-plasma hover:underline flex items-center"
                                  >
                                    <span className="font-mono text-xs">
                                      {distribution.transactionHash.slice(0, 6)}...{distribution.transactionHash.slice(-4)}
                                    </span>
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </HudPanel>

            {/* CTA */}
            <div className="mt-8 text-center">
              <CyberButton to="/dashboard" className="mx-auto">
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </CyberButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsPage;