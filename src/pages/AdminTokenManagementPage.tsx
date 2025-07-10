import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Shield, 
  Settings, 
  Download, 
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  Lock,
  Unlock,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Calendar,
  Wallet,
  Database,
  Globe,
  Zap,
  Target,
  X,
  Save,
  Plus,
  Minus,
  Copy,
  ExternalLink
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';

interface TokenMetrics {
  totalSupply: number;
  circulatingSupply: number;
  lockedTokens: number;
  burnedTokens: number;
  currentPrice: number;
  marketCap: number;
  holders: number;
  transactions24h: number;
  volume24h: number;
  distributedProfits: number;
  nextDistribution: string;
  vestingSchedule: {
    cliff: number;
    duration: number;
    released: number;
    remaining: number;
  };
}

interface TokenHolder {
  id: string;
  address: string;
  balance: number;
  percentage: number;
  firstTransaction: string;
  lastActivity: string;
  kycStatus: 'verified' | 'pending' | 'unverified';
  investmentTier: 'retail' | 'accredited' | 'institutional';
  lockupExpiry?: string;
  vestingSchedule?: {
    total: number;
    vested: number;
    nextUnlock: string;
  };
}

interface Transaction {
  id: string;
  hash: string;
  type: 'mint' | 'burn' | 'transfer' | 'distribution' | 'vesting';
  from?: string;
  to?: string;
  amount: number;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed?: number;
  blockNumber?: number;
}

interface ComplianceCheck {
  id: string;
  type: 'aml' | 'sanctions' | 'kyc' | 'accreditation';
  status: 'passed' | 'failed' | 'pending';
  lastCheck: string;
  nextCheck: string;
  details: string;
}

interface DistributionEvent {
  id: string;
  amount: number;
  profitPeriod: string;
  distributionDate: string;
  eligibleHolders: number;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
}

const AdminTokenManagementPage: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'holders' | 'transactions' | 'distribution' | 'compliance' | 'configuration'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Token metrics state
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics>({
    totalSupply: 100000000,
    circulatingSupply: 90000000,
    lockedTokens: 10000000,
    burnedTokens: 0,
    currentPrice: 1.50,
    marketCap: 135000000,
    holders: 3,
    transactions24h: 12,
    volume24h: 45000,
    distributedProfits: 0,
    nextDistribution: 'Q4 2025',
    vestingSchedule: {
      cliff: 6,
      duration: 24,
      released: 0,
      remaining: 10000000
    }
  });

  // Token holders state
  const [tokenHolders, setTokenHolders] = useState<TokenHolder[]>([]);
  const [filteredHolders, setFilteredHolders] = useState<TokenHolder[]>([]);
  const [holderSearchTerm, setHolderSearchTerm] = useState('');
  const [holderFilter, setHolderFilter] = useState<'all' | 'verified' | 'pending' | 'unverified'>('all');

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'mint' | 'burn' | 'transfer' | 'distribution'>('all');

  // Distribution state
  const [distributions, setDistributions] = useState<DistributionEvent[]>([]);
  const [newDistribution, setNewDistribution] = useState({
    amount: '',
    profitPeriod: '',
    distributionDate: ''
  });

  // Compliance state
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);

  // Configuration state
  const [tokenConfig, setTokenConfig] = useState({
    name: 'DRONE Token',
    symbol: 'DRONE',
    decimals: 18,
    maxSupply: 100000000,
    mintingEnabled: true,
    burningEnabled: true,
    transfersEnabled: true,
    distributionEnabled: true
  });

  // Mint/Burn state
  const [mintForm, setMintForm] = useState({
    recipient: '',
    amount: '',
    reason: ''
  });

  const [burnForm, setBurnForm] = useState({
    amount: '',
    reason: ''
  });

  useEffect(() => {
    loadTokenData();
  }, []);

  useEffect(() => {
    applyHolderFilters();
  }, [tokenHolders, holderSearchTerm, holderFilter]);

  useEffect(() => {
    applyTransactionFilters();
  }, [transactions, transactionFilter]);

  const loadTokenData = async () => {
    setIsLoading(true);
    try {
      // Load mock data for demonstration
      await loadTokenHolders();
      await loadTransactions();
      await loadDistributions();
      await loadComplianceChecks();
      
      await logAdminAction('VIEW_TOKEN_MANAGEMENT', 'Accessed token management dashboard');
    } catch (error) {
      console.error('Failed to load token data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTokenHolders = async () => {
    // Mock data for demonstration
    const mockHolders: TokenHolder[] = [
      {
        id: 'holder-001',
        address: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
        balance: 125000,
        percentage: 0.125,
        firstTransaction: '2025-01-15T10:30:00Z',
        lastActivity: '2025-01-27T14:20:00Z',
        kycStatus: 'verified',
        investmentTier: 'institutional',
        lockupExpiry: '2025-07-15T00:00:00Z',
        vestingSchedule: {
          total: 125000,
          vested: 31250,
          nextUnlock: '2025-04-15T00:00:00Z'
        }
      },
      {
        id: 'holder-002',
        address: '0x8ba1f109551bD432803012645Hac136c0532925a',
        balance: 500000,
        percentage: 0.5,
        firstTransaction: '2025-01-10T12:00:00Z',
        lastActivity: '2025-01-27T16:15:00Z',
        kycStatus: 'verified',
        investmentTier: 'institutional',
        lockupExpiry: '2025-07-10T00:00:00Z',
        vestingSchedule: {
          total: 500000,
          vested: 125000,
          nextUnlock: '2025-04-10T00:00:00Z'
        }
      },
      {
        id: 'holder-003',
        address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        balance: 75000,
        percentage: 0.075,
        firstTransaction: '2025-01-20T09:15:00Z',
        lastActivity: '2025-01-26T11:30:00Z',
        kycStatus: 'pending',
        investmentTier: 'accredited'
      }
    ];

    setTokenHolders(mockHolders);
  };

  const loadTransactions = async () => {
    // Mock data for demonstration
    const mockTransactions: Transaction[] = [
      {
        id: 'tx-001',
        hash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        type: 'mint',
        to: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
        amount: 125000,
        timestamp: '2025-01-15T10:30:00Z',
        status: 'confirmed',
        gasUsed: 65000,
        blockNumber: 12345678
      },
      {
        id: 'tx-002',
        hash: '0xdef456ghi789jkl012mno345pqr678stu901vwx234yz567abc',
        type: 'mint',
        to: '0x8ba1f109551bD432803012645Hac136c0532925a',
        amount: 500000,
        timestamp: '2025-01-10T12:00:00Z',
        status: 'confirmed',
        gasUsed: 68000,
        blockNumber: 12345123
      },
      {
        id: 'tx-003',
        hash: '0xghi789jkl012mno345pqr678stu901vwx234yz567abc890def',
        type: 'transfer',
        from: '0x8ba1f109551bD432803012645Hac136c0532925a',
        to: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        amount: 25000,
        timestamp: '2025-01-25T14:45:00Z',
        status: 'confirmed',
        gasUsed: 21000,
        blockNumber: 12356789
      }
    ];

    setTransactions(mockTransactions);
  };

  const loadDistributions = async () => {
    // Mock data for demonstration
    const mockDistributions: DistributionEvent[] = [
      {
        id: 'dist-001',
        amount: 0,
        profitPeriod: 'TBA',
        distributionDate: '2026-01-15T00:00:00Z',
        eligibleHolders: 3,
        status: 'scheduled'
      }
    ];

    setDistributions(mockDistributions);
  };

  const loadComplianceChecks = async () => {
    // Mock data for demonstration
    const mockCompliance: ComplianceCheck[] = [
      {
        id: 'comp-001',
        type: 'aml',
        status: 'passed',
        lastCheck: '2025-01-27T00:00:00Z',
        nextCheck: '2025-02-27T00:00:00Z',
        details: 'All token holders passed AML screening'
      },
      {
        id: 'comp-002',
        type: 'sanctions',
        status: 'passed',
        lastCheck: '2025-01-27T00:00:00Z',
        nextCheck: '2025-02-27T00:00:00Z',
        details: 'No sanctions list matches found'
      },
      {
        id: 'comp-003',
        type: 'kyc',
        status: 'pending',
        lastCheck: '2025-01-27T00:00:00Z',
        nextCheck: '2025-01-28T00:00:00Z',
        details: '1 holder pending KYC verification'
      },
      {
        id: 'comp-004',
        type: 'accreditation',
        status: 'passed',
        lastCheck: '2025-01-27T00:00:00Z',
        nextCheck: '2025-04-27T00:00:00Z',
        details: 'All holders meet accreditation requirements'
      }
    ];

    setComplianceChecks(mockCompliance);
  };

  const applyHolderFilters = () => {
    let filtered = [...tokenHolders];

    if (holderSearchTerm) {
      filtered = filtered.filter(holder =>
        holder.address.toLowerCase().includes(holderSearchTerm.toLowerCase())
      );
    }

    if (holderFilter !== 'all') {
      filtered = filtered.filter(holder => holder.kycStatus === holderFilter);
    }

    setFilteredHolders(filtered);
  };

  const applyTransactionFilters = () => {
    let filtered = [...transactions];

    if (transactionFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === transactionFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleMintTokens = async () => {
    try {
      // In production, this would interact with the smart contract
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type: 'mint',
        to: mintForm.recipient,
        amount: parseInt(mintForm.amount),
        timestamp: new Date().toISOString(),
        status: 'pending',
        gasUsed: 65000,
        blockNumber: 12356790
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update metrics
      setTokenMetrics(prev => ({
        ...prev,
        totalSupply: prev.totalSupply + parseInt(mintForm.amount),
        circulatingSupply: prev.circulatingSupply + parseInt(mintForm.amount)
      }));

      setShowMintModal(false);
      setMintForm({ recipient: '', amount: '', reason: '' });

      await logAdminAction('MINT_TOKENS', `Minted ${mintForm.amount} tokens to ${mintForm.recipient}`);
    } catch (error) {
      console.error('Failed to mint tokens:', error);
    }
  };

  const handleBurnTokens = async () => {
    try {
      // In production, this would interact with the smart contract
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type: 'burn',
        amount: parseInt(burnForm.amount),
        timestamp: new Date().toISOString(),
        status: 'pending',
        gasUsed: 45000,
        blockNumber: 12356791
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update metrics
      setTokenMetrics(prev => ({
        ...prev,
        totalSupply: prev.totalSupply - parseInt(burnForm.amount),
        burnedTokens: prev.burnedTokens + parseInt(burnForm.amount)
      }));

      setShowBurnModal(false);
      setBurnForm({ amount: '', reason: '' });

      await logAdminAction('BURN_TOKENS', `Burned ${burnForm.amount} tokens`);
    } catch (error) {
      console.error('Failed to burn tokens:', error);
    }
  };

  const handleScheduleDistribution = async () => {
    try {
      const newDistribution: DistributionEvent = {
        id: `dist-${Date.now()}`,
        amount: parseFloat(newDistribution.amount),
        profitPeriod: newDistribution.profitPeriod,
        distributionDate: newDistribution.distributionDate,
        eligibleHolders: tokenHolders.filter(h => h.kycStatus === 'verified').length,
        status: 'scheduled'
      };

      setDistributions(prev => [newDistribution, ...prev]);
      setShowDistributionModal(false);
      setNewDistribution({ amount: '', profitPeriod: '', distributionDate: '' });

      await logAdminAction('SCHEDULE_DISTRIBUTION', `Scheduled profit distribution for ${newDistribution.profitPeriod}`);
    } catch (error) {
      console.error('Failed to schedule distribution:', error);
    }
  };

  const handleExportData = async (type: 'holders' | 'transactions' | 'distributions') => {
    try {
      let csvContent = '';
      let filename = '';

      switch (type) {
        case 'holders':
          csvContent = [
            ['Address', 'Balance', 'Percentage', 'KYC Status', 'Investment Tier', 'First Transaction', 'Last Activity'].join(','),
            ...filteredHolders.map(holder => [
              holder.address,
              holder.balance,
              (holder.percentage * 100).toFixed(3) + '%',
              holder.kycStatus,
              holder.investmentTier,
              holder.firstTransaction,
              holder.lastActivity
            ].join(','))
          ].join('\n');
          filename = `drone-token-holders-${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'transactions':
          csvContent = [
            ['Hash', 'Type', 'From', 'To', 'Amount', 'Timestamp', 'Status', 'Block Number'].join(','),
            ...filteredTransactions.map(tx => [
              tx.hash,
              tx.type,
              tx.from || '',
              tx.to || '',
              tx.amount,
              tx.timestamp,
              tx.status,
              tx.blockNumber || ''
            ].join(','))
          ].join('\n');
          filename = `drone-token-transactions-${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'distributions':
          csvContent = [
            ['Amount', 'Profit Period', 'Distribution Date', 'Eligible Holders', 'Status'].join(','),
            ...distributions.map(dist => [
              dist.amount,
              dist.profitPeriod,
              dist.distributionDate,
              dist.eligibleHolders,
              dist.status
            ].join(','))
          ].join('\n');
          filename = `drone-token-distributions-${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await logAdminAction('EXPORT_DATA', `Exported ${type} data to CSV`);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const logAdminAction = async (action: string, details: string) => {
    try {
      await supabase.rpc('log_admin_audit_action', {
        p_admin_id: adminUser?.id || 'unknown',
        p_action: action,
        p_details: details,
        p_ip_address: 'unknown',
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'passed':
      case 'verified':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
      case 'processing':
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
      case 'unverified':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'passed':
      case 'verified':
      case 'completed':
        return 'text-green-400 bg-green-900';
      case 'pending':
      case 'processing':
      case 'scheduled':
        return 'text-yellow-400 bg-yellow-900';
      case 'failed':
      case 'unverified':
        return 'text-red-400 bg-red-900';
      default:
        return 'text-gray-400 bg-gray-900';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Token Management</h1>
          <p className="text-gray-400">Comprehensive DRONE token administration and monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <CyberButton onClick={loadTokenData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
          <CyberButton onClick={() => setShowConfigModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </CyberButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-[#0d0d14] p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'holders', label: 'Token Holders', icon: Users },
          { id: 'transactions', label: 'Transactions', icon: Activity },
          { id: 'distribution', label: 'Profit Distribution', icon: TrendingUp },
          { id: 'compliance', label: 'Compliance', icon: Shield },
          { id: 'configuration', label: 'Configuration', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-6 rounded transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Total Supply</h3>
                <DollarSign className="w-5 h-5 text-plasma" />
              </div>
              <p className="text-2xl font-bold text-plasma">{formatTokenAmount(tokenMetrics.totalSupply)}</p>
              <p className="text-sm text-gray-400">DRONE Tokens</p>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Market Cap</h3>
                <TrendingUp className="w-5 h-5 text-plasma" />
              </div>
              <p className="text-2xl font-bold text-plasma">{formatCurrency(tokenMetrics.marketCap)}</p>
              <p className="text-sm text-gray-400">Current Valuation</p>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Token Holders</h3>
                <Users className="w-5 h-5 text-plasma" />
              </div>
              <p className="text-2xl font-bold text-plasma">{tokenMetrics.holders}</p>
              <p className="text-sm text-gray-400">Verified Investors</p>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Token Price</h3>
                <Target className="w-5 h-5 text-plasma" />
              </div>
              <p className="text-2xl font-bold text-plasma">{formatCurrency(tokenMetrics.currentPrice)}</p>
              <p className="text-sm text-gray-400">Per Token</p>
            </HudPanel>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <PieChart className="text-plasma mr-3 w-6 h-6" />
                  Token Distribution
                </h2>
                <CyberButton className="text-xs py-1 px-3">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </CyberButton>
              </div>
              <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500">Token Distribution Chart</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Circulating:</span>
                      <span className="text-plasma">{((tokenMetrics.circulatingSupply / tokenMetrics.totalSupply) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Locked:</span>
                      <span className="text-yellow-400">{((tokenMetrics.lockedTokens / tokenMetrics.totalSupply) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Burned:</span>
                      <span className="text-red-400">{((tokenMetrics.burnedTokens / tokenMetrics.totalSupply) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <BarChart3 className="text-plasma mr-3 w-6 h-6" />
                  Transaction Volume
                </h2>
                <CyberButton className="text-xs py-1 px-3">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </CyberButton>
              </div>
              <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500">Transaction Volume Chart</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>24h Transactions:</span>
                      <span className="text-plasma">{tokenMetrics.transactions24h}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>24h Volume:</span>
                      <span className="text-plasma">{formatCurrency(tokenMetrics.volume24h)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
          </div>

          {/* Vesting Schedule */}
          <HudPanel className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Clock className="text-plasma mr-3 w-6 h-6" />
              Vesting Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400">Cliff Period</p>
                <p className="text-lg font-bold text-plasma">{tokenMetrics.vestingSchedule.cliff} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Duration</p>
                <p className="text-lg font-bold text-plasma">{tokenMetrics.vestingSchedule.duration} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Released</p>
                <p className="text-lg font-bold text-green-400">{formatTokenAmount(tokenMetrics.vestingSchedule.released)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Remaining</p>
                <p className="text-lg font-bold text-yellow-400">{formatTokenAmount(tokenMetrics.vestingSchedule.remaining)}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                <div 
                  className="bg-plasma h-full rounded-full" 
                  style={{ width: `${(tokenMetrics.vestingSchedule.released / (tokenMetrics.vestingSchedule.released + tokenMetrics.vestingSchedule.remaining)) * 100}%` }}
                ></div>
              </div>
            </div>
          </HudPanel>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Plus className="text-plasma mr-2 w-5 h-5" />
                Mint Tokens
              </h3>
              <p className="text-gray-400 mb-4">Create new tokens for authorized recipients</p>
              <CyberButton 
                onClick={() => setShowMintModal(true)}
                className="w-full"
                disabled={!tokenConfig.mintingEnabled}
              >
                <Plus className="w-4 h-4 mr-2" />
                Mint Tokens
              </CyberButton>
            </HudPanel>

            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Minus className="text-ion mr-2 w-5 h-5" />
                Burn Tokens
              </h3>
              <p className="text-gray-400 mb-4">Permanently remove tokens from circulation</p>
              <CyberButton 
                onClick={() => setShowBurnModal(true)}
                variant="red"
                className="w-full"
                disabled={!tokenConfig.burningEnabled}
              >
                <Minus className="w-4 h-4 mr-2" />
                Burn Tokens
              </CyberButton>
            </HudPanel>

            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Send className="text-plasma mr-2 w-5 h-5" />
                Profit Distribution
              </h3>
              <p className="text-gray-400 mb-4">Schedule quarterly profit distributions</p>
              <CyberButton 
                onClick={() => setShowDistributionModal(true)}
                className="w-full"
                disabled={!tokenConfig.distributionEnabled}
              >
                <Send className="w-4 h-4 mr-2" />
                Schedule Distribution
              </CyberButton>
            </HudPanel>
          </div>
        </div>
      )}

      {activeTab === 'holders' && (
        <div className="space-y-6">
          {/* Filters */}
          <HudPanel className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by address..."
                    value={holderSearchTerm}
                    onChange={(e) => setHolderSearchTerm(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={holderFilter}
                  onChange={(e) => setHolderFilter(e.target.value as any)}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="all">All KYC Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="unverified">Unverified</option>
                </select>
                <CyberButton onClick={() => handleExportData('holders')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </CyberButton>
              </div>
            </div>
          </HudPanel>

          {/* Holders Table */}
          <HudPanel className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Address</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Balance</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Percentage</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">KYC Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Vesting</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHolders.map((holder) => (
                    <tr key={holder.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">{formatAddress(holder.address)}</span>
                          <button
                            onClick={() => copyToClipboard(holder.address)}
                            className="text-gray-400 hover:text-plasma"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{formatTokenAmount(holder.balance)} DRONE</p>
                          <p className="text-sm text-gray-400">{formatCurrency(holder.balance * tokenMetrics.currentPrice)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{(holder.percentage * 100).toFixed(3)}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(holder.kycStatus)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(holder.kycStatus)}`}>
                            {holder.kycStatus.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize">{holder.investmentTier}</span>
                      </td>
                      <td className="py-3 px-4">
                        {holder.vestingSchedule ? (
                          <div>
                            <p className="text-sm">{formatTokenAmount(holder.vestingSchedule.vested)} / {formatTokenAmount(holder.vestingSchedule.total)}</p>
                            <p className="text-xs text-gray-400">Next: {formatDate(holder.vestingSchedule.nextUnlock)}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No vesting</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`https://etherscan.io/address/${holder.address}`, '_blank')}
                            className="text-plasma hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="text-blue-400 hover:text-blue-300">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </HudPanel>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filters */}
          <HudPanel className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value as any)}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="all">All Transactions</option>
                  <option value="mint">Mint</option>
                  <option value="burn">Burn</option>
                  <option value="transfer">Transfer</option>
                  <option value="distribution">Distribution</option>
                </select>
              </div>
              <CyberButton onClick={() => handleExportData('transactions')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </CyberButton>
            </div>
          </HudPanel>

          {/* Transactions Table */}
          <HudPanel className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Hash</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">From/To</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">{formatAddress(tx.hash)}</span>
                          <button
                            onClick={() => copyToClipboard(tx.hash)}
                            className="text-gray-400 hover:text-plasma"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {tx.type === 'mint' && <ArrowDownRight className="w-4 h-4 text-green-400" />}
                          {tx.type === 'burn' && <ArrowUpRight className="w-4 h-4 text-red-400" />}
                          {tx.type === 'transfer' && <ArrowUpRight className="w-4 h-4 text-blue-400" />}
                          {tx.type === 'distribution' && <Send className="w-4 h-4 text-plasma" />}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {tx.from && <p>From: {formatAddress(tx.from)}</p>}
                          {tx.to && <p>To: {formatAddress(tx.to)}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatTokenAmount(tx.amount)} DRONE</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(tx.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{formatDate(tx.timestamp)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                          className="text-plasma hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </HudPanel>
        </div>
      )}

      {activeTab === 'distribution' && (
        <div className="space-y-6">
          {/* Distribution Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-2">Total Distributed</h3>
              <p className="text-2xl font-bold text-plasma">{formatCurrency(tokenMetrics.distributedProfits)}</p>
              <p className="text-sm text-gray-400">Lifetime profits shared</p>
            </HudPanel>

            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-2">Next Distribution</h3>
              <p className="text-2xl font-bold text-plasma">{tokenMetrics.nextDistribution}</p>
              <p className="text-sm text-gray-400">Scheduled period</p>
            </HudPanel>

            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-2">Eligible Holders</h3>
              <p className="text-2xl font-bold text-plasma">{tokenHolders.filter(h => h.kycStatus === 'verified').length}</p>
              <p className="text-sm text-gray-400">Verified investors</p>
            </HudPanel>
          </div>

          {/* Distribution History */}
          <HudPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Distribution History</h2>
              <div className="flex space-x-4">
                <CyberButton onClick={() => handleExportData('distributions')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </CyberButton>
                <CyberButton onClick={() => setShowDistributionModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Distribution
                </CyberButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Profit Period</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Distribution Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Eligible Holders</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map((dist) => (
                    <tr key={dist.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatCurrency(dist.amount)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{dist.profitPeriod}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{formatDate(dist.distributionDate)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{dist.eligibleHolders}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(dist.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(dist.status)}`}>
                            {dist.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-plasma hover:text-white">
                            <Eye className="w-4 h-4" />
                          </button>
                          {dist.transactionHash && (
                            <button
                              onClick={() => window.open(`https://etherscan.io/tx/${dist.transactionHash}`, '_blank')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </HudPanel>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {complianceChecks.map((check) => (
              <HudPanel key={check.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">{check.type.toUpperCase()}</h3>
                  {getStatusIcon(check.status)}
                </div>
                <p className={`text-lg font-bold ${
                  check.status === 'passed' ? 'text-green-400' :
                  check.status === 'pending' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {check.status.toUpperCase()}
                </p>
                <p className="text-sm text-gray-400">Next: {formatDate(check.nextCheck)}</p>
              </HudPanel>
            ))}
          </div>

          {/* Compliance Details */}
          <HudPanel className="p-6">
            <h2 className="text-xl font-bold mb-6">Compliance Status Details</h2>
            <div className="space-y-4">
              {complianceChecks.map((check) => (
                <div key={check.id} className="bg-[#0d0d14] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <h3 className="font-bold capitalize">{check.type} Screening</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(check.status)}`}>
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-2">{check.details}</p>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Last Check: {formatDate(check.lastCheck)}</span>
                    <span>Next Check: {formatDate(check.nextCheck)}</span>
                  </div>
                </div>
              ))}
            </div>
          </HudPanel>

          {/* Compliance Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-4">Manual Compliance Check</h3>
              <p className="text-gray-400 mb-4">Run immediate compliance verification for all token holders</p>
              <CyberButton className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Run Compliance Check
              </CyberButton>
            </HudPanel>

            <HudPanel className="p-6">
              <h3 className="text-lg font-bold mb-4">Generate Compliance Report</h3>
              <p className="text-gray-400 mb-4">Export detailed compliance status for regulatory reporting</p>
              <CyberButton className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </CyberButton>
            </HudPanel>
          </div>
        </div>
      )}

      {activeTab === 'configuration' && (
        <div className="space-y-6">
          {/* Token Configuration */}
          <HudPanel className="p-6">
            <h2 className="text-xl font-bold mb-6">Token Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
                <input
                  type="text"
                  value={tokenConfig.name}
                  readOnly
                  className="w-full bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
                <input
                  type="text"
                  value={tokenConfig.symbol}
                  readOnly
                  className="w-full bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Decimals</label>
                <input
                  type="number"
                  value={tokenConfig.decimals}
                  readOnly
                  className="w-full bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Supply</label>
                <input
                  type="number"
                  value={tokenConfig.maxSupply}
                  readOnly
                  className="w-full bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md"
                />
              </div>
            </div>
          </HudPanel>

          {/* Feature Toggles */}
          <HudPanel className="p-6">
            <h2 className="text-xl font-bold mb-6">Feature Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                <div>
                  <h3 className="font-bold">Minting</h3>
                  <p className="text-sm text-gray-400">Allow creation of new tokens</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tokenConfig.mintingEnabled ? 'bg-plasma' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tokenConfig.mintingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                <div>
                  <h3 className="font-bold">Burning</h3>
                  <p className="text-sm text-gray-400">Allow permanent token destruction</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tokenConfig.burningEnabled ? 'bg-plasma' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tokenConfig.burningEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                <div>
                  <h3 className="font-bold">Transfers</h3>
                  <p className="text-sm text-gray-400">Allow token transfers between addresses</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tokenConfig.transfersEnabled ? 'bg-plasma' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tokenConfig.transfersEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                <div>
                  <h3 className="font-bold">Distributions</h3>
                  <p className="text-sm text-gray-400">Allow profit distributions to holders</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tokenConfig.distributionEnabled ? 'bg-plasma' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tokenConfig.distributionEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </HudPanel>

          {/* Smart Contract Information */}
          <HudPanel className="p-6">
            <h2 className="text-xl font-bold mb-6">Smart Contract Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contract Address</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value="0x1234567890123456789012345678901234567890"
                    readOnly
                    className="flex-1 bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard('0x1234567890123456789012345678901234567890')}
                    className="text-plasma hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open('https://etherscan.io/address/0x1234567890123456789012345678901234567890', '_blank')}
                    className="text-plasma hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                <input
                  type="text"
                  value="Base Mainnet"
                  readOnly
                  className="w-full bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token Standard</label>
                <input
                  type="text"
                  value="ERC-1400 (Security Token)"
                  readOnly
                  className="w-full bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md"
                />
              </div>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Mint Tokens Modal */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Mint Tokens</h2>
              <button
                onClick={() => setShowMintModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address *
                </label>
                <input
                  type="text"
                  value={mintForm.recipient}
                  onChange={(e) => setMintForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma font-mono"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={mintForm.amount}
                  onChange={(e) => setMintForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter token amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason *
                </label>
                <textarea
                  value={mintForm.reason}
                  onChange={(e) => setMintForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Provide reason for minting tokens..."
                  required
                />
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-300">
                    This action will create new tokens and increase the total supply. It requires multi-signature approval.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  onClick={handleMintTokens}
                  className="flex-1"
                  disabled={!mintForm.recipient || !mintForm.amount || !mintForm.reason}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Mint Tokens
                </CyberButton>
                <CyberButton
                  onClick={() => setShowMintModal(false)}
                  variant="red"
                  className="px-6"
                >
                  Cancel
                </CyberButton>
              </div>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Burn Tokens Modal */}
      {showBurnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Burn Tokens</h2>
              <button
                onClick={() => setShowBurnModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={burnForm.amount}
                  onChange={(e) => setBurnForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter token amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason *
                </label>
                <textarea
                  value={burnForm.reason}
                  onChange={(e) => setBurnForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Provide reason for burning tokens..."
                  required
                />
              </div>

              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-300">
                    This action will permanently destroy tokens and reduce the total supply. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  onClick={handleBurnTokens}
                  variant="red"
                  className="flex-1"
                  disabled={!burnForm.amount || !burnForm.reason}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Burn Tokens
                </CyberButton>
                <CyberButton
                  onClick={() => setShowBurnModal(false)}
                  className="px-6"
                >
                  Cancel
                </CyberButton>
              </div>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Distribution Modal */}
      {showDistributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Schedule Profit Distribution</h2>
              <button
                onClick={() => setShowDistributionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Distribution Amount (EUR) *
                </label>
                <input
                  type="number"
                  value={newDistribution.amount}
                  onChange={(e) => setNewDistribution(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter amount in EUR"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profit Period *
                </label>
                <input
                  type="text"
                  value={newDistribution.profitPeriod}
                  onChange={(e) => setNewDistribution(prev => ({ ...prev, profitPeriod: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="e.g., Q1 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Distribution Date *
                </label>
                <input
                  type="datetime-local"
                  value={newDistribution.distributionDate}
                  onChange={(e) => setNewDistribution(prev => ({ ...prev, distributionDate: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  required
                />
              </div>

              <div className="bg-[#0d0d14] p-4 rounded-lg">
                <h4 className="font-bold mb-2">Distribution Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Eligible Holders:</span>
                    <span>{tokenHolders.filter(h => h.kycStatus === 'verified').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Distribution:</span>
                    <span>{newDistribution.amount ? formatCurrency(parseFloat(newDistribution.amount)) : '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  onClick={handleScheduleDistribution}
                  className="flex-1"
                  disabled={!newDistribution.amount || !newDistribution.profitPeriod || !newDistribution.distributionDate}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Distribution
                </CyberButton>
                <CyberButton
                  onClick={() => setShowDistributionModal(false)}
                  variant="red"
                  className="px-6"
                >
                  Cancel
                </CyberButton>
              </div>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Token Configuration</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Token Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token Name
                    </label>
                    <input
                      type="text"
                      value={tokenConfig.name}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token Symbol
                    </label>
                    <input
                      type="text"
                      value={tokenConfig.symbol}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Decimals
                    </label>
                    <input
                      type="number"
                      value={tokenConfig.decimals}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Supply
                    </label>
                    <input
                      type="number"
                      value={tokenConfig.maxSupply}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Feature Controls</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                    <div>
                      <h4 className="font-bold">Minting</h4>
                      <p className="text-sm text-gray-400">Allow creation of new tokens</p>
                    </div>
                    <button
                      onClick={() => setTokenConfig(prev => ({ ...prev, mintingEnabled: !prev.mintingEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tokenConfig.mintingEnabled ? 'bg-plasma' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tokenConfig.mintingEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                    <div>
                      <h4 className="font-bold">Burning</h4>
                      <p className="text-sm text-gray-400">Allow permanent token destruction</p>
                    </div>
                    <button
                      onClick={() => setTokenConfig(prev => ({ ...prev, burningEnabled: !prev.burningEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tokenConfig.burningEnabled ? 'bg-plasma' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tokenConfig.burningEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                    <div>
                      <h4 className="font-bold">Transfers</h4>
                      <p className="text-sm text-gray-400">Allow token transfers between addresses</p>
                    </div>
                    <button
                      onClick={() => setTokenConfig(prev => ({ ...prev, transfersEnabled: !prev.transfersEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tokenConfig.transfersEnabled ? 'bg-plasma' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tokenConfig.transfersEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg">
                    <div>
                      <h4 className="font-bold">Distributions</h4>
                      <p className="text-sm text-gray-400">Allow profit distributions to holders</p>
                    </div>
                    <button
                      onClick={() => setTokenConfig(prev => ({ ...prev, distributionEnabled: !prev.distributionEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tokenConfig.distributionEnabled ? 'bg-plasma' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tokenConfig.distributionEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-300">Configuration Warning</p>
                    <p className="text-sm text-yellow-200">
                      Changing token parameters requires multi-signature approval and may have regulatory implications.
                      All changes are permanently recorded on the blockchain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </CyberButton>
                <CyberButton
                  onClick={() => setShowConfigModal(false)}
                  variant="red"
                  className="px-6"
                >
                  Cancel
                </CyberButton>
              </div>
            </div>
          </HudPanel>
        </div>
      )}
    </div>
  );
};

export default AdminTokenManagementPage;