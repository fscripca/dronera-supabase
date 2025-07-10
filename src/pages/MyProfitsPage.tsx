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
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useInterval } from '../hooks/useInterval';

interface ProfitDistribution {
  id: string;
  amount: number;
  distribution_date: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  participant_count: number;
  transaction_hash?: string;
  distribution_type: 'regular' | 'special';
  notes?: string;
  created_at: string;
  pool_id: string;
  pool_name?: string;
}

interface ProfitPool {
  id: string;
  name: string;
  total_amount: number;
  allocated_amount: number;
  remaining_amount: number;
  currency: string;
  source: string;
  status: string;
  description?: string;
  created_at: string;
}

interface UserProfitData {
  total_received: number;
  pending_amount: number;
  next_distribution_date?: string;
  next_distribution_amount?: number;
  distributions: ProfitDistribution[];
  allocation_percentage: number;
  token_balance: number;
}

const MyProfitsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Data states
  const [profitData, setProfitData] = useState<UserProfitData>({
    total_received: 0,
    pending_amount: 0,
    distributions: [],
    allocation_percentage: 0,
    token_balance: 0
  });
  const [profitPools, setProfitPools] = useState<ProfitPool[]>([]);
  
  // Filter and view states
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Chart data
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Refs
  const filtersRef = useRef<HTMLDivElement>(null);

  // Fetch user profit data
  const fetchProfitData = async () => {
    if (!user) return;
    
    try {
      setError(null);
      
      // Get user's profit participant data - use maybeSingle() to handle no results gracefully
      const { data: participantData, error: participantError } = await supabase
        .from('profit_participants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (participantError) {
        throw participantError;
      }
      
      // If no participant data found, set default empty values
      if (!participantData) {
        setProfitData({
          total_received: 0,
          pending_amount: 0,
          distributions: [],
          allocation_percentage: 0,
          token_balance: 0
        });
        setChartData([]);
        return;
      }
      
      // Get profit distributions for the user - only if participant data exists
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('profit_distribution_logs')
        .select(`
          *,
          profit_distributions!inner(
            id,
            amount,
            distribution_date,
            status,
            participant_count,
            transaction_hash,
            distribution_type,
            notes,
            created_at,
            pool_id,
            profit_pools(name)
          )
        `)
        .eq('participant_id', participantData.id)
        .order('created_at', { ascending: false });
      
      if (distributionsError) {
        throw distributionsError;
      }
      
      // Process distributions data
      const processedDistributions: ProfitDistribution[] = distributionsData?.map(log => ({
        id: log.profit_distributions.id,
        amount: parseFloat(log.amount),
        distribution_date: log.profit_distributions.distribution_date,
        status: log.profit_distributions.status,
        participant_count: log.profit_distributions.participant_count,
        transaction_hash: log.profit_distributions.transaction_hash,
        distribution_type: log.profit_distributions.distribution_type,
        notes: log.profit_distributions.notes,
        created_at: log.profit_distributions.created_at,
        pool_id: log.profit_distributions.pool_id,
        pool_name: log.profit_distributions.profit_pools?.name
      })) || [];
      
      // Calculate totals
      const totalReceived = processedDistributions
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.amount, 0);
      
      const pendingAmount = processedDistributions
        .filter(d => d.status === 'scheduled' || d.status === 'processing')
        .reduce((sum, d) => sum + d.amount, 0);
      
      // Get next distribution date
      const nextDistribution = processedDistributions
        .filter(d => d.status === 'scheduled')
        .sort((a, b) => new Date(a.distribution_date).getTime() - new Date(b.distribution_date).getTime())[0];
      
      setProfitData({
        total_received: totalReceived,
        pending_amount: pendingAmount,
        next_distribution_date: nextDistribution?.distribution_date,
        next_distribution_amount: nextDistribution?.amount,
        distributions: processedDistributions,
        allocation_percentage: participantData.allocation_percentage || 0,
        token_balance: participantData.token_balance || 0
      });
      
      // Prepare chart data
      const chartDataPoints = processedDistributions
        .filter(d => d.status === 'completed')
        .map(d => ({
          date: new Date(d.distribution_date).toLocaleDateString(),
          amount: d.amount,
          type: d.distribution_type
        }))
        .reverse();
      
      setChartData(chartDataPoints);
      
    } catch (err) {
      console.error('Error fetching profit data:', err);
      setError('Failed to load profit data');
    }
  };

  // Fetch profit pools
  const fetchProfitPools = async () => {
    try {
      const { data, error } = await supabase
        .from('profit_pools')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProfitPools(data || []);
    } catch (err) {
      console.error('Error fetching profit pools:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfitData(),
        fetchProfitPools()
      ]);
      setLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  // Auto-refresh data every 30 seconds
  useInterval(() => {
    if (user && !loading) {
      handleRefresh();
    }
  }, 30000);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProfitData(),
      fetchProfitPools()
    ]);
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  // Filter distributions
  const filteredDistributions = profitData.distributions.filter(distribution => {
    // Status filter
    if (selectedStatus !== 'all' && distribution.status !== selectedStatus) {
      return false;
    }
    
    // Timeframe filter
    if (selectedTimeframe !== 'all') {
      const distributionDate = new Date(distribution.distribution_date);
      const now = new Date();
      
      switch (selectedTimeframe) {
        case '7d':
          return distributionDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
          return distributionDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d':
          return distributionDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case '1y':
          return distributionDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    }
    
    return true;
  }).sort((a, b) => {
    const aValue = sortBy === 'date' ? new Date(a.distribution_date).getTime() : a.amount;
    const bValue = sortBy === 'date' ? new Date(b.distribution_date).getTime() : b.amount;
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Amount', 'Status', 'Type', 'Pool', 'Transaction Hash'].join(','),
      ...filteredDistributions.map(d => [
        new Date(d.distribution_date).toLocaleDateString(),
        d.amount.toString(),
        d.status,
        d.distribution_type,
        d.pool_name || '',
        d.transaction_hash || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-distributions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-900 text-green-300 text-xs uppercase rounded flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      case 'pending':
      case 'scheduled':
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs uppercase rounded flex items-center"><Clock className="w-3 h-3 mr-1" /> {status === 'pending' ? 'Pending' : 'Scheduled'}</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs uppercase rounded flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> Processing</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-900 text-red-300 text-xs uppercase rounded flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 text-gray-300 text-xs uppercase rounded">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stealth flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-[#0a0a0f] border-b border-gray-800">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-plasma" />
              <span className="font-bold text-white">My Profits</span>
            </div>
          </div>
          <div className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-plasma animate-spin mx-auto mb-4" />
              <p className="text-xl text-gray-300">Loading profit data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="font-bold text-white">My Profits</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Profits</h1>
                <p className="text-gray-400">Track your profit distributions from DRONERA</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400 hidden md:block">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <CyberButton onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </CyberButton>
                <CyberButton onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </CyberButton>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Total Received</h3>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(profitData.total_received)}</p>
                <p className="text-sm text-gray-400">Across {profitData.distributions.filter(d => d.status === 'completed').length} distributions</p>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Pending Profits</h3>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">{formatCurrency(profitData.pending_amount)}</p>
                <p className="text-sm text-gray-400">Scheduled or pending</p>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Next Distribution</h3>
                  <Calendar className="w-5 h-5 text-plasma" />
                </div>
                {profitData.next_distribution_date ? (
                  <>
                    <p className="text-2xl font-bold text-plasma">
                      {formatCurrency(profitData.next_distribution_amount || 0)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Expected {new Date(profitData.next_distribution_date).toLocaleDateString()}
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
                  <h2 className="text-xl font-bold">Profit History</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Last 12 months</span>
                    <CyberButton className="text-xs py-1 px-2">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </CyberButton>
                  </div>
                </div>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No profit history to display</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-[#0d0d14] rounded-lg flex items-end justify-around p-4">
                    {/* Simple bar chart visualization */}
                    {chartData.slice(-12).map((point, index) => {
                      const maxAmount = Math.max(...chartData.map(p => p.amount));
                      const height = (point.amount / maxAmount) * 100;
                      
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="flex-1 w-full flex items-end">
                            <div 
                              className="w-8 bg-plasma bg-opacity-30 rounded-t-sm"
                              style={{ height: `${height}%`, minHeight: '4px' }}
                            >
                              <div 
                                className="w-full bg-plasma rounded-t-sm"
                                style={{ height: '60%' }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2 whitespace-nowrap">
                            {point.date.split('/').slice(0, 2).join('/')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Distribution Breakdown</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">By source</span>
                    <CyberButton className="text-xs py-1 px-2">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </CyberButton>
                  </div>
                </div>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No distribution data to display</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center">
                    {/* Simple pie chart visualization */}
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 rounded-full border-8 border-plasma opacity-30"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-8 border-transparent border-t-plasma border-r-plasma" 
                        style={{ transform: 'rotate(45deg)' }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Total</p>
                          <p className="text-xl font-bold text-plasma">{formatCurrency(profitData.total_received)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </HudPanel>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
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
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Timeframe</label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-plasma bg-opacity-20 text-plasma' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'chart' 
                      ? 'bg-plasma bg-opacity-20 text-plasma' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <PieChart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profit Distributions */}
            <HudPanel className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Profit Distributions</h2>
              
              {viewMode === 'list' ? (
                filteredDistributions.length === 0 ? (
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
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Source</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Period</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDistributions.map((distribution) => (
                          <tr key={distribution.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                            <td className="py-3 px-4">
                              {new Date(distribution.distribution_date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {distribution.pool_name || 'Q3 2025 Profits'}
                            </td>
                            <td className="py-3 px-4">
                              {distribution.distribution_type === 'regular' ? 'July - September 2025' : 'One-time Event'}
                            </td>
                            <td className="py-3 px-4 font-medium text-green-400">
                              {formatCurrency(distribution.amount)}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={distribution.status} />
                            </td>
                            <td className="py-3 px-4">
                              {distribution.transaction_hash ? (
                                <a 
                                  href={`https://basescan.org/tx/${distribution.transaction_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-plasma hover:underline flex items-center"
                                >
                                  <span className="font-mono text-xs">
                                    {distribution.transaction_hash.slice(0, 6)}...{distribution.transaction_hash.slice(-4)}
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
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Distribution by Month Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Monthly Distribution</h3>
                    <div className="h-64 bg-[#0d0d14] rounded-lg p-4 flex items-end justify-around">
                      {chartData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-gray-500">No data available</p>
                        </div>
                      ) : (
                        chartData.slice(-6).map((point, index) => {
                          const maxAmount = Math.max(...chartData.map(p => p.amount));
                          const height = (point.amount / maxAmount) * 100;
                          
                          return (
                            <div key={index} className="flex flex-col items-center">
                              <div className="flex-1 w-full flex items-end">
                                <div 
                                  className="w-12 bg-plasma bg-opacity-30 rounded-t-sm"
                                  style={{ height: `${height}%`, minHeight: '4px' }}
                                >
                                  <div 
                                    className="w-full bg-plasma rounded-t-sm"
                                    style={{ height: '60%' }}
                                  ></div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400 mt-2">
                                {point.date.split('/').slice(0, 2).join('/')}
                              </div>
                              <div className="text-xs text-plasma">
                                €{point.amount.toLocaleString()}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  {/* Distribution by Type Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Distribution by Type</h3>
                    <div className="h-64 bg-[#0d0d14] rounded-lg p-4 flex items-center justify-center">
                      {chartData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-gray-500">No data available</p>
                        </div>
                      ) : (
                        <div className="relative w-40 h-40">
                          <div className="absolute inset-0 rounded-full border-8 border-plasma opacity-30"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-transparent border-t-plasma border-r-plasma" 
                            style={{ transform: 'rotate(45deg)' }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Total</p>
                              <p className="text-xl font-bold text-plasma">{formatCurrency(profitData.total_received)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </HudPanel>

            {/* Profit Allocation */}
            <HudPanel className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Profit Allocation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Your Allocation</h3>
                  <div className="bg-[#0d0d14] p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">Allocation Percentage</span>
                      <span className="text-xl font-bold text-plasma">{profitData.allocation_percentage.toFixed(4)}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">Token Balance</span>
                      <span className="text-xl font-bold">{profitData.token_balance.toLocaleString()} DRONE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Token Value</span>
                      <span className="text-xl font-bold">{formatCurrency(profitData.token_balance * 1.5)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Profit Calculation</h3>
                  <div className="bg-[#0d0d14] p-6 rounded-lg">
                    <p className="text-gray-300 mb-4">
                      Your profit allocation is calculated based on your token holdings relative to the total token supply.
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Your Tokens</span>
                      <span className="font-medium">{profitData.token_balance.toLocaleString()} DRONE</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Total Supply</span>
                      <span className="font-medium">100,000,000 DRONE</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 pt-2 border-t border-gray-800">
                      <span className="text-gray-400">Your Share</span>
                      <span className="font-medium text-plasma">{profitData.allocation_percentage.toFixed(4)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>

            {/* Active Profit Pools */}
            {profitPools.length > 0 && (
              <HudPanel className="p-6">
                <h2 className="text-xl font-bold mb-6">Active Profit Pools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profitPools.map((pool) => (
                    <div key={pool.id} className="bg-[#0d0d14] p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{pool.name}</h4>
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                          {pool.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Amount:</span>
                          <span>{formatCurrency(pool.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Allocated:</span>
                          <span>{formatCurrency(pool.allocated_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Remaining:</span>
                          <span>{formatCurrency(pool.remaining_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Source:</span>
                          <span>{pool.source}</span>
                        </div>
                      </div>
                      {pool.description && (
                        <p className="text-xs text-gray-400 mt-3">{pool.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </HudPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfitsPage;