import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Download, 
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart2,
  PieChart,
  FileText,
  Settings,
  Plus,
  X,
  Save,
  Percent,
  ArrowRight,
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Activity,
  Zap,
  Shield,
  Eye
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface ProfitPool {
  id: string;
  name: string;
  totalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  currency: string;
  source: string;
  createdAt: string;
  status: 'active' | 'pending' | 'closed';
  description?: string;
}

interface Distribution {
  id: string;
  poolId: string;
  poolName: string;
  amount: number;
  distributionDate: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  participantCount: number;
  transactionHash?: string;
  createdBy: string;
  createdAt: string;
  distributionType: 'regular' | 'special';
  notes?: string;
}

interface Participant {
  id: string;
  userId: string;
  email: string;
  walletAddress: string;
  tokenBalance: number;
  allocationPercentage: number;
  allocationAmount: number;
  kycStatus: 'verified' | 'pending' | 'declined';
  lastDistribution?: string;
  totalReceived: number;
  status: 'active' | 'inactive';
}

interface DistributionRule {
  id: string;
  name: string;
  description: string;
  formula: string;
  isDefault: boolean;
  minTokens: number;
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'inactive';
}

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  metadata?: any;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const AdminProfitSharingPage: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'pools' | 'distributions' | 'participants' | 'rules' | 'audit'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [showCreateDistributionModal, setShowCreateDistributionModal] = useState(false);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [showDistributionPreviewModal, setShowDistributionPreviewModal] = useState(false);
  
  // Data states
  const [profitPools, setProfitPools] = useState<ProfitPool[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [distributionRules, setDistributionRules] = useState<DistributionRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Filter states
  const [poolFilter, setPoolFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>({
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [newPoolForm, setNewPoolForm] = useState({
    name: '',
    totalAmount: '',
    currency: 'EUR',
    source: '',
    description: ''
  });
  
  const [newDistributionForm, setNewDistributionForm] = useState({
    poolId: '',
    amount: '',
    distributionDate: '',
    distributionType: 'regular',
    ruleId: '',
    notes: ''
  });
  
  const [newRuleForm, setNewRuleForm] = useState({
    name: '',
    description: '',
    formula: 'token_balance',
    minTokens: '0',
    isDefault: false
  });
  
  // Preview state
  const [distributionPreview, setDistributionPreview] = useState<{
    totalAmount: number;
    participantCount: number;
    participants: Array<{
      email: string;
      walletAddress: string;
      tokenBalance: number;
      allocationPercentage: number;
      allocationAmount: number;
    }>;
  }>({
    totalAmount: 0,
    participantCount: 0,
    participants: []
  });
  
  // Filtered data
  const [filteredDistributions, setFilteredDistributions] = useState<Distribution[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [filteredAuditLogs, setFilteredAuditLogs] = useState<AuditLog[]>([]);
  
  // Summary metrics
  const [metrics, setMetrics] = useState({
    totalDistributed: 0,
    pendingDistributions: 0,
    activeParticipants: 0,
    averageAllocation: 0,
    nextDistributionDate: '',
    nextDistributionAmount: 0,
    totalProfitPool: 0,
    allocatedAmount: 0,
    remainingAmount: 0
  });
  
  // Charts data
  const [distributionHistory, setDistributionHistory] = useState<any[]>([]);
  const [participantAllocation, setParticipantAllocation] = useState<any[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting
  const [sortField, setSortField] = useState<string>('distributionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Bulk actions
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Refs for file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [
    distributions, 
    participants, 
    auditLogs, 
    poolFilter, 
    statusFilter, 
    dateRangeFilter, 
    searchTerm,
    sortField,
    sortDirection
  ]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadProfitPools(),
        loadDistributions(),
        loadParticipants(),
        loadDistributionRules(),
        loadAuditLogs()
      ]);
      
      calculateMetrics();
      prepareChartData();
      
      await logAdminAction('VIEW_PROFIT_SHARING', 'Accessed profit sharing dashboard');
    } catch (error) {
      console.error('Failed to load profit sharing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadProfitPools = async () => {
    try {
      // In production, this would fetch from Supabase
      // For now, using mock data
      const mockPools: ProfitPool[] = [
        {
          id: 'pool-001',
          name: 'Q1 2025 Profit Pool',
          totalAmount: 250000,
          allocatedAmount: 150000,
          remainingAmount: 100000,
          currency: 'EUR',
          source: 'Operational Profits',
          createdAt: '2025-01-15T10:30:00Z',
          status: 'active',
          description: 'Profit pool for Q1 2025 distribution to token holders'
        },
        {
          id: 'pool-002',
          name: 'Q2 2025 Profit Pool',
          totalAmount: 350000,
          allocatedAmount: 0,
          remainingAmount: 350000,
          currency: 'EUR',
          source: 'Operational Profits',
          createdAt: '2025-03-30T14:20:00Z',
          status: 'pending',
          description: 'Profit pool for Q2 2025 distribution to token holders'
        },
        {
          id: 'pool-003',
          name: 'Special Distribution - EU Grant',
          totalAmount: 175000,
          allocatedAmount: 175000,
          remainingAmount: 0,
          currency: 'EUR',
          source: 'EU Defense Fund Grant',
          createdAt: '2025-02-10T09:15:00Z',
          status: 'closed',
          description: 'Special distribution from EU Defense Fund grant'
        }
      ];
      
      setProfitPools(mockPools);
    } catch (error) {
      console.error('Failed to load profit pools:', error);
    }
  };
  
  const loadDistributions = async () => {
    try {
      // In production, this would fetch from Supabase
      // For now, using mock data
      const mockDistributions: Distribution[] = [
        {
          id: 'dist-001',
          poolId: 'pool-001',
          poolName: 'Q1 2025 Profit Pool',
          amount: 150000,
          distributionDate: '2025-04-15T00:00:00Z',
          status: 'scheduled',
          participantCount: 3,
          createdBy: 'admin@dronera.eu',
          createdAt: '2025-01-20T11:30:00Z',
          distributionType: 'regular',
          notes: 'Regular quarterly distribution to token holders'
        },
        {
          id: 'dist-002',
          poolId: 'pool-003',
          poolName: 'Special Distribution - EU Grant',
          amount: 175000,
          distributionDate: '2025-03-01T00:00:00Z',
          status: 'completed',
          participantCount: 3,
          transactionHash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
          createdBy: 'admin@dronera.eu',
          createdAt: '2025-02-15T09:45:00Z',
          distributionType: 'special',
          notes: 'Special distribution from EU Defense Fund grant'
        }
      ];
      
      setDistributions(mockDistributions);
    } catch (error) {
      console.error('Failed to load distributions:', error);
    }
  };
  
  const loadParticipants = async () => {
    try {
      // In production, this would fetch from Supabase
      // For now, using mock data
      const mockParticipants: Participant[] = [
        {
          id: 'part-001',
          userId: 'user-001',
          email: 'florin@dronera.eu',
          walletAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
          tokenBalance: 125000,
          allocationPercentage: 17.86,
          allocationAmount: 26786.25,
          kycStatus: 'verified',
          lastDistribution: '2025-03-01T00:00:00Z',
          totalReceived: 26786.25,
          status: 'active'
        },
        {
          id: 'part-002',
          userId: 'user-004',
          email: 'premium.investor@wealth.com',
          walletAddress: '0x8ba1f109551bD432803012645Hac136c0532925a',
          tokenBalance: 500000,
          allocationPercentage: 71.43,
          allocationAmount: 107145,
          kycStatus: 'verified',
          lastDistribution: '2025-03-01T00:00:00Z',
          totalReceived: 107145,
          status: 'active'
        },
        {
          id: 'part-003',
          userId: 'user-003',
          email: 'test.user@gmail.com',
          walletAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          tokenBalance: 75000,
          allocationPercentage: 10.71,
          allocationAmount: 16068.75,
          kycStatus: 'pending',
          totalReceived: 0,
          status: 'inactive'
        }
      ];
      
      setParticipants(mockParticipants);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };
  
  const loadDistributionRules = async () => {
    try {
      // In production, this would fetch from Supabase
      // For now, using mock data
      const mockRules: DistributionRule[] = [
        {
          id: 'rule-001',
          name: 'Standard Token Balance',
          description: 'Distribute profits proportionally based on token balance',
          formula: 'token_balance',
          isDefault: true,
          minTokens: 0,
          createdAt: '2025-01-10T08:00:00Z',
          lastUsed: '2025-03-01T00:00:00Z',
          status: 'active'
        },
        {
          id: 'rule-002',
          name: 'Institutional Investor Bonus',
          description: 'Institutional investors receive 10% bonus allocation',
          formula: 'token_balance * (investment_tier == "institutional" ? 1.1 : 1.0)',
          isDefault: false,
          minTokens: 100000,
          createdAt: '2025-01-15T14:30:00Z',
          status: 'active'
        },
        {
          id: 'rule-003',
          name: 'Early Investor Bonus',
          description: 'Early investors (before 2025-02-01) receive 5% bonus',
          formula: 'token_balance * (first_transaction_date < "2025-02-01" ? 1.05 : 1.0)',
          isDefault: false,
          minTokens: 50000,
          createdAt: '2025-01-20T11:15:00Z',
          status: 'inactive'
        }
      ];
      
      setDistributionRules(mockRules);
    } catch (error) {
      console.error('Failed to load distribution rules:', error);
    }
  };
  
  const loadAuditLogs = async () => {
    try {
      // In production, this would fetch from Supabase
      // For now, using mock data
      const mockLogs: AuditLog[] = [
        {
          id: 'log-001',
          action: 'CREATE_PROFIT_POOL',
          performedBy: 'admin@dronera.eu',
          timestamp: '2025-01-15T10:30:00Z',
          details: 'Created Q1 2025 Profit Pool with €250,000',
          metadata: {
            poolId: 'pool-001',
            amount: 250000,
            currency: 'EUR'
          }
        },
        {
          id: 'log-002',
          action: 'SCHEDULE_DISTRIBUTION',
          performedBy: 'admin@dronera.eu',
          timestamp: '2025-01-20T11:30:00Z',
          details: 'Scheduled distribution of €150,000 for 2025-04-15',
          metadata: {
            distributionId: 'dist-001',
            poolId: 'pool-001',
            amount: 150000
          }
        },
        {
          id: 'log-003',
          action: 'COMPLETE_DISTRIBUTION',
          performedBy: 'system',
          timestamp: '2025-03-01T00:05:00Z',
          details: 'Completed distribution of €175,000 to 2 participants',
          metadata: {
            distributionId: 'dist-002',
            poolId: 'pool-003',
            amount: 175000,
            participantCount: 2,
            transactionHash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
          }
        },
        {
          id: 'log-004',
          action: 'CREATE_DISTRIBUTION_RULE',
          performedBy: 'admin@dronera.eu',
          timestamp: '2025-01-10T08:00:00Z',
          details: 'Created Standard Token Balance distribution rule',
          metadata: {
            ruleId: 'rule-001',
            formula: 'token_balance'
          }
        },
        {
          id: 'log-005',
          action: 'CREATE_PROFIT_POOL',
          performedBy: 'admin@dronera.eu',
          timestamp: '2025-03-30T14:20:00Z',
          details: 'Created Q2 2025 Profit Pool with €350,000',
          metadata: {
            poolId: 'pool-002',
            amount: 350000,
            currency: 'EUR'
          }
        }
      ];
      
      setAuditLogs(mockLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };
  
  const calculateMetrics = () => {
    // Calculate total distributed
    const totalDistributed = distributions
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);
    
    // Calculate pending distributions
    const pendingDistributions = distributions
      .filter(d => d.status === 'scheduled' || d.status === 'processing')
      .reduce((sum, d) => sum + d.amount, 0);
    
    // Calculate active participants
    const activeParticipants = participants.filter(p => p.status === 'active').length;
    
    // Calculate average allocation
    const totalAllocation = participants.reduce((sum, p) => sum + p.allocationAmount, 0);
    const averageAllocation = activeParticipants > 0 ? totalAllocation / activeParticipants : 0;
    
    // Find next distribution
    const futureDistributions = distributions
      .filter(d => d.status === 'scheduled' && new Date(d.distributionDate) > new Date())
      .sort((a, b) => new Date(a.distributionDate).getTime() - new Date(b.distributionDate).getTime());
    
    const nextDistributionDate = futureDistributions.length > 0 ? futureDistributions[0].distributionDate : '';
    const nextDistributionAmount = futureDistributions.length > 0 ? futureDistributions[0].amount : 0;
    
    // Calculate pool totals
    const totalProfitPool = profitPools.reduce((sum, p) => sum + p.totalAmount, 0);
    const allocatedAmount = profitPools.reduce((sum, p) => sum + p.allocatedAmount, 0);
    const remainingAmount = profitPools.reduce((sum, p) => sum + p.remainingAmount, 0);
    
    setMetrics({
      totalDistributed,
      pendingDistributions,
      activeParticipants,
      averageAllocation,
      nextDistributionDate,
      nextDistributionAmount,
      totalProfitPool,
      allocatedAmount,
      remainingAmount
    });
  };
  
  const prepareChartData = () => {
    // Prepare distribution history data
    const historyData = distributions
      .filter(d => d.status === 'completed')
      .sort((a, b) => new Date(a.distributionDate).getTime() - new Date(b.distributionDate).getTime())
      .map(d => ({
        date: new Date(d.distributionDate).toLocaleDateString(),
        amount: d.amount
      }));
    
    setDistributionHistory(historyData);
    
    // Prepare participant allocation data
    const allocationData = participants
      .filter(p => p.status === 'active')
      .sort((a, b) => b.allocationPercentage - a.allocationPercentage)
      .map(p => ({
        name: p.email.split('@')[0],
        value: p.allocationPercentage
      }));
    
    setParticipantAllocation(allocationData);
  };
  
  const applyFilters = () => {
    // Filter distributions
    let filtered = [...distributions];
    
    if (poolFilter !== 'all') {
      filtered = filtered.filter(d => d.poolId === poolFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      const endDate = new Date(dateRangeFilter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(d => {
        const distributionDate = new Date(d.distributionDate);
        return distributionDate >= startDate && distributionDate <= endDate;
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.poolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'distributionDate':
          aValue = new Date(a.distributionDate);
          bValue = new Date(b.distributionDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'participantCount':
          aValue = a.participantCount;
          bValue = b.participantCount;
          break;
        default:
          aValue = new Date(a.distributionDate);
          bValue = new Date(b.distributionDate);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredDistributions(filtered);
    
    // Filter participants
    let filteredParts = [...participants];
    
    if (searchTerm) {
      filteredParts = filteredParts.filter(p => 
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all' && statusFilter !== 'scheduled' && statusFilter !== 'processing' && statusFilter !== 'completed' && statusFilter !== 'failed') {
      // For participant status filtering
      filteredParts = filteredParts.filter(p => p.status === statusFilter);
    }
    
    setFilteredParticipants(filteredParts);
    
    // Filter audit logs
    let filteredLogs = [...auditLogs];
    
    if (searchTerm) {
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      const endDate = new Date(dateRangeFilter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    }
    
    // Sort logs by timestamp descending
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredAuditLogs(filteredLogs);
  };
  
  const handleCreateProfitPool = async () => {
    try {
      const newPool: ProfitPool = {
        id: `pool-${Date.now()}`,
        name: newPoolForm.name,
        totalAmount: parseFloat(newPoolForm.totalAmount),
        allocatedAmount: 0,
        remainingAmount: parseFloat(newPoolForm.totalAmount),
        currency: newPoolForm.currency,
        source: newPoolForm.source,
        createdAt: new Date().toISOString(),
        status: 'active',
        description: newPoolForm.description
      };
      
      setProfitPools(prev => [newPool, ...prev]);
      setShowCreatePoolModal(false);
      setNewPoolForm({
        name: '',
        totalAmount: '',
        currency: 'EUR',
        source: '',
        description: ''
      });
      
      // Add to audit log
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        action: 'CREATE_PROFIT_POOL',
        performedBy: adminUser?.email || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Created ${newPool.name} with ${newPool.currency} ${newPool.totalAmount.toLocaleString()}`,
        metadata: {
          poolId: newPool.id,
          amount: newPool.totalAmount,
          currency: newPool.currency
        }
      };
      
      setAuditLogs(prev => [newLog, ...prev]);
      
      // Update metrics
      calculateMetrics();
      
      await logAdminAction('CREATE_PROFIT_POOL', `Created profit pool: ${newPool.name} with ${newPool.currency} ${newPool.totalAmount.toLocaleString()}`);
    } catch (error) {
      console.error('Failed to create profit pool:', error);
    }
  };
  
  const handleCreateDistribution = async () => {
    try {
      // Find the pool
      const pool = profitPools.find(p => p.id === newDistributionForm.poolId);
      if (!pool) return;
      
      // Validate amount
      const amount = parseFloat(newDistributionForm.amount);
      if (amount > pool.remainingAmount) {
        alert(`Distribution amount exceeds remaining pool amount (${pool.currency} ${pool.remainingAmount.toLocaleString()})`);
        return;
      }
      
      // Create distribution
      const newDistribution: Distribution = {
        id: `dist-${Date.now()}`,
        poolId: pool.id,
        poolName: pool.name,
        amount,
        distributionDate: newDistributionForm.distributionDate,
        status: 'scheduled',
        participantCount: participants.filter(p => p.status === 'active' && p.kycStatus === 'verified').length,
        createdBy: adminUser?.email || 'unknown',
        createdAt: new Date().toISOString(),
        distributionType: newDistributionForm.distributionType as 'regular' | 'special',
        notes: newDistributionForm.notes
      };
      
      setDistributions(prev => [newDistribution, ...prev]);
      
      // Update pool allocated amount
      const updatedPools = profitPools.map(p => {
        if (p.id === pool.id) {
          return {
            ...p,
            allocatedAmount: p.allocatedAmount + amount,
            remainingAmount: p.remainingAmount - amount
          };
        }
        return p;
      });
      
      setProfitPools(updatedPools);
      
      // Add to audit log
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        action: 'SCHEDULE_DISTRIBUTION',
        performedBy: adminUser?.email || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Scheduled distribution of ${pool.currency} ${amount.toLocaleString()} for ${new Date(newDistributionForm.distributionDate).toLocaleDateString()}`,
        metadata: {
          distributionId: newDistribution.id,
          poolId: pool.id,
          amount
        }
      };
      
      setAuditLogs(prev => [newLog, ...prev]);
      
      // Reset form and close modal
      setShowCreateDistributionModal(false);
      setNewDistributionForm({
        poolId: '',
        amount: '',
        distributionDate: '',
        distributionType: 'regular',
        ruleId: '',
        notes: ''
      });
      
      // Update metrics
      calculateMetrics();
      
      await logAdminAction('SCHEDULE_DISTRIBUTION', `Scheduled distribution of ${pool.currency} ${amount.toLocaleString()} for ${new Date(newDistributionForm.distributionDate).toLocaleDateString()}`);
    } catch (error) {
      console.error('Failed to create distribution:', error);
    }
  };
  
  const handleCreateRule = async () => {
    try {
      const newRule: DistributionRule = {
        id: `rule-${Date.now()}`,
        name: newRuleForm.name,
        description: newRuleForm.description,
        formula: newRuleForm.formula,
        isDefault: newRuleForm.isDefault,
        minTokens: parseInt(newRuleForm.minTokens),
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      // If this is set as default, update other rules
      let updatedRules = [...distributionRules];
      if (newRule.isDefault) {
        updatedRules = updatedRules.map(rule => ({
          ...rule,
          isDefault: false
        }));
      }
      
      setDistributionRules([newRule, ...updatedRules]);
      
      // Add to audit log
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        action: 'CREATE_DISTRIBUTION_RULE',
        performedBy: adminUser?.email || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Created distribution rule: ${newRule.name}`,
        metadata: {
          ruleId: newRule.id,
          formula: newRule.formula,
          isDefault: newRule.isDefault
        }
      };
      
      setAuditLogs(prev => [newLog, ...prev]);
      
      // Reset form and close modal
      setShowCreateRuleModal(false);
      setNewRuleForm({
        name: '',
        description: '',
        formula: 'token_balance',
        minTokens: '0',
        isDefault: false
      });
      
      await logAdminAction('CREATE_DISTRIBUTION_RULE', `Created distribution rule: ${newRule.name}`);
    } catch (error) {
      console.error('Failed to create distribution rule:', error);
    }
  };
  
  const handlePreviewDistribution = () => {
    try {
      // Find the pool
      const pool = profitPools.find(p => p.id === newDistributionForm.poolId);
      if (!pool) return;
      
      // Find the rule
      const rule = distributionRules.find(r => r.id === newDistributionForm.ruleId);
      if (!rule) return;
      
      // Get eligible participants (active and KYC verified)
      const eligibleParticipants = participants.filter(p => 
        p.status === 'active' && 
        p.kycStatus === 'verified' &&
        p.tokenBalance >= rule.minTokens
      );
      
      if (eligibleParticipants.length === 0) {
        alert('No eligible participants found for this distribution');
        return;
      }
      
      // Calculate total token balance of eligible participants
      const totalTokenBalance = eligibleParticipants.reduce((sum, p) => sum + p.tokenBalance, 0);
      
      // Calculate allocation for each participant based on the rule
      const amount = parseFloat(newDistributionForm.amount);
      const previewParticipants = eligibleParticipants.map(p => {
        let allocationPercentage = 0;
        
        // Apply the formula (simplified for demo)
        if (rule.formula === 'token_balance') {
          allocationPercentage = (p.tokenBalance / totalTokenBalance) * 100;
        } else if (rule.formula.includes('investment_tier')) {
          // Apply institutional bonus (simplified)
          const bonus = p.tokenBalance >= 100000 ? 1.1 : 1.0;
          allocationPercentage = ((p.tokenBalance * bonus) / (totalTokenBalance * 1.05)) * 100;
        } else if (rule.formula.includes('first_transaction_date')) {
          // Apply early investor bonus (simplified)
          const bonus = new Date(p.lastDistribution || '2025-01-01') < new Date('2025-02-01') ? 1.05 : 1.0;
          allocationPercentage = ((p.tokenBalance * bonus) / (totalTokenBalance * 1.025)) * 100;
        }
        
        const allocationAmount = (allocationPercentage / 100) * amount;
        
        return {
          email: p.email,
          walletAddress: p.walletAddress,
          tokenBalance: p.tokenBalance,
          allocationPercentage,
          allocationAmount
        };
      });
      
      setDistributionPreview({
        totalAmount: amount,
        participantCount: previewParticipants.length,
        participants: previewParticipants
      });
      
      setShowDistributionPreviewModal(true);
    } catch (error) {
      console.error('Failed to preview distribution:', error);
    }
  };
  
  const handleExportData = (type: 'distributions' | 'participants' | 'audit') => {
    try {
      let csvContent = '';
      let filename = '';
      
      switch (type) {
        case 'distributions':
          csvContent = [
            ['ID', 'Pool', 'Amount', 'Date', 'Status', 'Participants', 'Type', 'Created By', 'Created At', 'Notes'].join(','),
            ...filteredDistributions.map(d => [
              d.id,
              d.poolName,
              d.amount,
              new Date(d.distributionDate).toLocaleDateString(),
              d.status,
              d.participantCount,
              d.distributionType,
              d.createdBy,
              new Date(d.createdAt).toLocaleDateString(),
              d.notes || ''
            ].join(','))
          ].join('\n');
          filename = `profit-distributions-${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'participants':
          csvContent = [
            ['ID', 'Email', 'Wallet Address', 'Token Balance', 'Allocation %', 'Allocation Amount', 'KYC Status', 'Last Distribution', 'Total Received', 'Status'].join(','),
            ...filteredParticipants.map(p => [
              p.id,
              p.email,
              p.walletAddress,
              p.tokenBalance,
              p.allocationPercentage.toFixed(2),
              p.allocationAmount.toFixed(2),
              p.kycStatus,
              p.lastDistribution ? new Date(p.lastDistribution).toLocaleDateString() : 'Never',
              p.totalReceived.toFixed(2),
              p.status
            ].join(','))
          ].join('\n');
          filename = `profit-participants-${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'audit':
          csvContent = [
            ['ID', 'Action', 'Performed By', 'Timestamp', 'Details'].join(','),
            ...filteredAuditLogs.map(log => [
              log.id,
              log.action,
              log.performedBy,
              new Date(log.timestamp).toLocaleString(),
              log.details
            ].join(','))
          ].join('\n');
          filename = `profit-sharing-audit-${new Date().toISOString().split('T')[0]}.csv`;
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
      
      logAdminAction('EXPORT_DATA', `Exported ${type} data to CSV`);
    } catch (error) {
      console.error(`Failed to export ${type} data:`, error);
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string;
        const rows = csvData.split('\n');
        const headers = rows[0].split(',');
        
        // Process CSV data based on headers
        console.log('CSV headers:', headers);
        
        // In a real implementation, you would parse the CSV and update the database
        
        logAdminAction('IMPORT_DATA', `Imported data from CSV file: ${file.name}`);
      } catch (error) {
        console.error('Failed to parse CSV file:', error);
        alert('Failed to parse CSV file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
  };
  
  const handleBulkAction = async (action: 'process' | 'cancel' | 'export') => {
    if (selectedItems.length === 0) return;
    
    try {
      switch (action) {
        case 'process':
          // Process selected distributions
          const updatedDistributions = distributions.map(dist => {
            if (selectedItems.includes(dist.id) && dist.status === 'scheduled') {
              return {
                ...dist,
                status: 'processing'
              };
            }
            return dist;
          });
          
          setDistributions(updatedDistributions);
          
          await logAdminAction('BULK_PROCESS_DISTRIBUTIONS', `Started processing ${selectedItems.length} distributions`);
          break;
          
        case 'cancel':
          // Cancel selected distributions
          if (!confirm(`Are you sure you want to cancel ${selectedItems.length} distributions? This action cannot be undone.`)) {
            return;
          }
          
          const canceledDistributions = distributions.map(dist => {
            if (selectedItems.includes(dist.id) && (dist.status === 'scheduled' || dist.status === 'processing')) {
              return {
                ...dist,
                status: 'failed'
              };
            }
            return dist;
          });
          
          setDistributions(canceledDistributions);
          
          // Update pool allocations
          const updatedPools = [...profitPools];
          for (const distId of selectedItems) {
            const dist = distributions.find(d => d.id === distId);
            if (dist && (dist.status === 'scheduled' || dist.status === 'processing')) {
              const poolIndex = updatedPools.findIndex(p => p.id === dist.poolId);
              if (poolIndex >= 0) {
                updatedPools[poolIndex] = {
                  ...updatedPools[poolIndex],
                  allocatedAmount: updatedPools[poolIndex].allocatedAmount - dist.amount,
                  remainingAmount: updatedPools[poolIndex].remainingAmount + dist.amount
                };
              }
            }
          }
          
          setProfitPools(updatedPools);
          
          await logAdminAction('BULK_CANCEL_DISTRIBUTIONS', `Canceled ${selectedItems.length} distributions`);
          break;
          
        case 'export':
          // Export selected distributions
          const selectedDistributions = distributions.filter(d => selectedItems.includes(d.id));
          
          const csvContent = [
            ['ID', 'Pool', 'Amount', 'Date', 'Status', 'Participants', 'Type', 'Created By', 'Created At', 'Notes'].join(','),
            ...selectedDistributions.map(d => [
              d.id,
              d.poolName,
              d.amount,
              new Date(d.distributionDate).toLocaleDateString(),
              d.status,
              d.participantCount,
              d.distributionType,
              d.createdBy,
              new Date(d.createdAt).toLocaleDateString(),
              d.notes || ''
            ].join(','))
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `selected-distributions-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          await logAdminAction('EXPORT_SELECTED_DISTRIBUTIONS', `Exported ${selectedItems.length} selected distributions`);
          break;
      }
      
      // Clear selection
      setSelectedItems([]);
    } catch (error) {
      console.error(`Failed to perform bulk action (${action}):`, error);
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
  
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
      case 'scheduled':
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'inactive':
      case 'failed':
      case 'closed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-400 bg-green-900';
      case 'pending':
      case 'scheduled':
      case 'processing':
        return 'text-yellow-400 bg-yellow-900';
      case 'inactive':
      case 'failed':
      case 'closed':
        return 'text-red-400 bg-red-900';
      default:
        return 'text-gray-400 bg-gray-900';
    }
  };
  
  const COLORS = ['#00ccff', '#0088cc', '#005588', '#003366', '#001144'];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profit Sharing</h1>
          <p className="text-gray-400">Manage profit distributions to token holders</p>
        </div>
        <div className="flex items-center space-x-4">
          <CyberButton onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
          <CyberButton onClick={() => setShowCreateDistributionModal(true)}>
            <DollarSign className="w-4 h-4 mr-2" />
            New Distribution
          </CyberButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-[#0d0d14] p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'pools', label: 'Profit Pools', icon: DollarSign },
          { id: 'distributions', label: 'Distributions', icon: TrendingUp },
          { id: 'participants', label: 'Participants', icon: Users },
          { id: 'rules', label: 'Distribution Rules', icon: Settings },
          { id: 'audit', label: 'Audit Log', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-6 rounded transition-colors whitespace-nowrap ${
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
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Total Distributed</h3>
                <TrendingUp className="w-5 h-5 text-plasma" />
              </div>
              <p className="text-2xl font-bold text-plasma">{formatCurrency(metrics.totalDistributed)}</p>
              <p className="text-sm text-gray-400">Lifetime distributions</p>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Pending Distributions</h3>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(metrics.pendingDistributions)}</p>
              <p className="text-sm text-gray-400">Scheduled for distribution</p>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Active Participants</h3>
                <Users className="w-5 h-5 text-plasma" />
              </div>
              <p className="text-2xl font-bold text-plasma">{metrics.activeParticipants}</p>
              <p className="text-sm text-gray-400">Eligible token holders</p>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider">Average Allocation</h3>
                <Percent className="w-5 h-5 text-plasma" />
              </div>
              <p className="text-2xl font-bold text-plasma">{formatCurrency(metrics.averageAllocation)}</p>
              <p className="text-sm text-gray-400">Per participant</p>
            </HudPanel>
          </div>

          {/* Next Distribution */}
          <HudPanel className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="text-plasma mr-3 w-6 h-6" />
              Next Scheduled Distribution
            </h2>
            
            {metrics.nextDistributionDate ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Distribution Date</p>
                  <p className="text-lg font-bold text-plasma">{new Date(metrics.nextDistributionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="text-lg font-bold text-plasma">{formatCurrency(metrics.nextDistributionAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Eligible Participants</p>
                  <p className="text-lg font-bold text-plasma">{metrics.activeParticipants}</p>
                </div>
                
                <div className="md:col-span-3 flex justify-end">
                  <CyberButton onClick={() => {
                    setActiveTab('distributions');
                  }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </CyberButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No distributions currently scheduled</p>
                <CyberButton onClick={() => setShowCreateDistributionModal(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Distribution
                </CyberButton>
              </div>
            )}
          </HudPanel>

          {/* Profit Pool Summary */}
          <HudPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <DollarSign className="text-plasma mr-3 w-6 h-6" />
                Profit Pool Summary
              </h2>
              <CyberButton onClick={() => setShowCreatePoolModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Pool
              </CyberButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-400">Total Profit Pool</p>
                <p className="text-lg font-bold text-plasma">{formatCurrency(metrics.totalProfitPool)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Allocated Amount</p>
                <p className="text-lg font-bold text-yellow-400">{formatCurrency(metrics.allocatedAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Remaining Amount</p>
                <p className="text-lg font-bold text-green-400">{formatCurrency(metrics.remainingAmount)}</p>
              </div>
            </div>
            
            <div className="w-full bg-[#0d0d14] h-4 rounded-full mb-2">
              <div 
                className="bg-plasma h-full rounded-full" 
                style={{ width: `${(metrics.allocatedAmount / metrics.totalProfitPool) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 text-right">
              {formatPercentage((metrics.allocatedAmount / metrics.totalProfitPool) * 100)} allocated
            </p>
            
            <div className="mt-6 flex justify-end">
              <CyberButton onClick={() => setActiveTab('pools')}>
                <ArrowRight className="w-4 h-4 mr-2" />
                View All Pools
              </CyberButton>
            </div>
          </HudPanel>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <BarChart2 className="text-plasma mr-3 w-6 h-6" />
                  Distribution History
                </h2>
                <CyberButton className="text-xs py-1 px-3" onClick={() => handleExportData('distributions')}>
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </CyberButton>
              </div>
              
              <div className="h-64">
                {distributionHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={distributionHistory}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#161620', borderColor: '#333' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="amount" fill="#00ccff" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">No distribution history available</p>
                    </div>
                  </div>
                )}
              </div>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <PieChart className="text-plasma mr-3 w-6 h-6" />
                  Participant Allocation
                </h2>
                <CyberButton className="text-xs py-1 px-3" onClick={() => handleExportData('participants')}>
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </CyberButton>
              </div>
              
              <div className="h-64">
                {participantAllocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={participantAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {participantAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#161620', borderColor: '#333' }}
                        formatter={(value: any) => [`${value.toFixed(2)}%`, 'Allocation']}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">No participant allocation data available</p>
                    </div>
                  </div>
                )}
              </div>
            </HudPanel>
          </div>

          {/* Recent Activity */}
          <HudPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <Activity className="text-plasma mr-3 w-6 h-6" />
                Recent Activity
              </h2>
              <CyberButton onClick={() => setActiveTab('audit')}>
                <FileText className="w-4 h-4 mr-2" />
                View Full Audit Log
              </CyberButton>
            </div>
            
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 bg-[#0d0d14] rounded-lg">
                  <div className="p-2 rounded-lg bg-[#161620] text-plasma">
                    {log.action.includes('CREATE') && <Plus className="w-4 h-4" />}
                    {log.action.includes('SCHEDULE') && <Calendar className="w-4 h-4" />}
                    {log.action.includes('COMPLETE') && <CheckCircle className="w-4 h-4" />}
                    {log.action.includes('EXPORT') && <Download className="w-4 h-4" />}
                    {!log.action.includes('CREATE') && 
                     !log.action.includes('SCHEDULE') && 
                     !log.action.includes('COMPLETE') && 
                     !log.action.includes('EXPORT') && <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.details}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-400">{formatDate(log.timestamp)}</p>
                      <span className="mx-2 text-gray-600">•</span>
                      <p className="text-xs text-gray-400">{log.performedBy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </HudPanel>
        </div>
      )}

      {activeTab === 'pools' && (
        <div className="space-y-6">
          {/* Filters and Actions */}
          <HudPanel className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search profit pools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
                <CyberButton onClick={() => setShowCreatePoolModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Pool
                </CyberButton>
              </div>
            </div>
          </HudPanel>

          {/* Profit Pools */}
          <HudPanel className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Total Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Allocated</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Remaining</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Source</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profitPools
                    .filter(pool => 
                      (statusFilter === 'all' || pool.status === statusFilter) &&
                      (searchTerm === '' || 
                       pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pool.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pool.description?.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((pool) => (
                      <tr key={pool.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{pool.name}</p>
                            {pool.description && (
                              <p className="text-sm text-gray-400">{pool.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatCurrency(pool.totalAmount, pool.currency)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium">{formatCurrency(pool.allocatedAmount, pool.currency)}</span>
                            <div className="w-full bg-[#0d0d14] h-1 rounded-full mt-1">
                              <div 
                                className="bg-plasma h-full rounded-full" 
                                style={{ width: `${(pool.allocatedAmount / pool.totalAmount) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatCurrency(pool.remainingAmount, pool.currency)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{pool.source}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(pool.status)}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(pool.status)}`}>
                              {pool.status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{formatDate(pool.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setNewDistributionForm(prev => ({
                                  ...prev,
                                  poolId: pool.id,
                                  amount: pool.remainingAmount.toString()
                                }));
                                setShowCreateDistributionModal(true);
                              }}
                              className="text-plasma hover:text-white"
                              disabled={pool.status !== 'active' || pool.remainingAmount <= 0}
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button className="text-blue-400 hover:text-blue-300">
                              <Edit className="w-4 h-4" />
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

      {activeTab === 'distributions' && (
        <div className="space-y-6">
          {/* Filters and Actions */}
          <HudPanel className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search distributions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={poolFilter}
                  onChange={(e) => setPoolFilter(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="all">All Profit Pools</option>
                  {profitPools.map(pool => (
                    <option key={pool.id} value={pool.id}>{pool.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Date Range:</span>
                <input
                  type="date"
                  value={dateRangeFilter.startDate}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRangeFilter.endDate}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                />
              </div>
              
              <div className="flex space-x-2">
                <CyberButton onClick={() => handleExportData('distributions')} className="text-xs py-1 px-3">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </CyberButton>
                <CyberButton onClick={() => setShowCreateDistributionModal(true)} className="text-xs py-1 px-3">
                  <Plus className="w-3 h-3 mr-1" />
                  New
                </CyberButton>
              </div>
            </div>
          </HudPanel>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <HudPanel className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {selectedItems.length} distributions selected
                </span>
                <div className="flex space-x-2">
                  <CyberButton 
                    onClick={() => handleBulkAction('process')}
                    className="text-xs py-1 px-3"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Process
                  </CyberButton>
                  <CyberButton 
                    onClick={() => handleBulkAction('cancel')}
                    className="text-xs py-1 px-3"
                    variant="red"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </CyberButton>
                  <CyberButton 
                    onClick={() => handleBulkAction('export')}
                    className="text-xs py-1 px-3"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </CyberButton>
                  <CyberButton 
                    onClick={() => setSelectedItems([])}
                    className="text-xs py-1 px-3"
                  >
                    Clear
                  </CyberButton>
                </div>
              </div>
            </HudPanel>
          )}

          {/* Distributions Table */}
          <HudPanel className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredDistributions.length && filteredDistributions.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredDistributions.map(d => d.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      <button 
                        className="flex items-center"
                        onClick={() => {
                          if (sortField === 'poolName') {
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('poolName');
                            setSortDirection('asc');
                          }
                        }}
                      >
                        Pool
                        {sortField === 'poolName' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      <button 
                        className="flex items-center"
                        onClick={() => {
                          if (sortField === 'amount') {
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('amount');
                            setSortDirection('desc');
                          }
                        }}
                      >
                        Amount
                        {sortField === 'amount' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      <button 
                        className="flex items-center"
                        onClick={() => {
                          if (sortField === 'distributionDate') {
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('distributionDate');
                            setSortDirection('desc');
                          }
                        }}
                      >
                        Date
                        {sortField === 'distributionDate' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      <button 
                        className="flex items-center"
                        onClick={() => {
                          if (sortField === 'status') {
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('status');
                            setSortDirection('asc');
                          }
                        }}
                      >
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      <button 
                        className="flex items-center"
                        onClick={() => {
                          if (sortField === 'participantCount') {
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('participantCount');
                            setSortDirection('desc');
                          }
                        }}
                      >
                        Participants
                        {sortField === 'participantCount' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Created By</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributions.map((dist) => (
                    <tr key={dist.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(dist.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(prev => [...prev, dist.id]);
                            } else {
                              setSelectedItems(prev => prev.filter(id => id !== dist.id));
                            }
                          }}
                          className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{dist.poolName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatCurrency(dist.amount)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{new Date(dist.distributionDate).toLocaleDateString()}</span>
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
                        <span>{dist.participantCount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize">{dist.distributionType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{dist.createdBy}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-plasma hover:text-white">
                            <Eye className="w-4 h-4" />
                          </button>
                          {dist.status === 'scheduled' && (
                            <button className="text-blue-400 hover:text-blue-300">
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {dist.transactionHash && (
                            <button
                              onClick={() => window.open(`https://etherscan.io/tx/${dist.transactionHash}`, '_blank')}
                              className="text-green-400 hover:text-green-300"
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

      {activeTab === 'participants' && (
        <div className="space-y-6">
          {/* Filters and Actions */}
          <HudPanel className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by email or wallet address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <CyberButton onClick={() => handleExportData('participants')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </CyberButton>
                <CyberButton onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Import
                </CyberButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </HudPanel>

          {/* Participants Table */}
          <HudPanel className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Wallet Address</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Token Balance</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Allocation %</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Distribution</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Total Received</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">KYC Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                      <td className="py-3 px-4">
                        <span className="font-medium">{participant.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">
                            {participant.walletAddress.slice(0, 6)}...{participant.walletAddress.slice(-4)}
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(participant.walletAddress)}
                            className="text-gray-400 hover:text-plasma"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{participant.tokenBalance.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatPercentage(participant.allocationPercentage)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{participant.lastDistribution ? formatDate(participant.lastDistribution) : 'Never'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatCurrency(participant.totalReceived)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(participant.kycStatus)}
                          <span className="capitalize">{participant.kycStatus}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(participant.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(participant.status)}`}>
                            {participant.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-plasma hover:text-white">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-blue-400 hover:text-blue-300">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`https://etherscan.io/address/${participant.walletAddress}`, '_blank')}
                            className="text-green-400 hover:text-green-300"
                          >
                            <ExternalLink className="w-4 h-4" />
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

      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Actions */}
          <HudPanel className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Distribution Rules</h2>
              <CyberButton onClick={() => setShowCreateRuleModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </CyberButton>
            </div>
          </HudPanel>

          {/* Rules List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {distributionRules.map((rule) => (
              <HudPanel key={rule.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{rule.name}</h3>
                    {rule.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-plasma bg-opacity-20 text-plasma mt-1">
                        Default Rule
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(rule.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rule.status)}`}>
                      {rule.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{rule.description}</p>
                
                <div className="bg-[#0d0d14] p-3 rounded-lg mb-4 font-mono text-sm">
                  <code>{rule.formula}</code>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <div>
                    <span>Min Tokens: </span>
                    <span className="text-plasma">{rule.minTokens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Created: </span>
                    <span>{new Date(rule.createdAt).toLocaleDateString()}</span>
                  </div>
                  {rule.lastUsed && (
                    <div>
                      <span>Last Used: </span>
                      <span>{new Date(rule.lastUsed).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-800">
                  <div className="flex space-x-2">
                    <CyberButton className="text-xs py-1 px-3">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </CyberButton>
                    {!rule.isDefault && (
                      <CyberButton className="text-xs py-1 px-3">
                        <Shield className="w-3 h-3 mr-1" />
                        Set Default
                      </CyberButton>
                    )}
                  </div>
                </div>
              </HudPanel>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Filters */}
          <HudPanel className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Date Range:</span>
                <input
                  type="date"
                  value={dateRangeFilter.startDate}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRangeFilter.endDate}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                />
                <CyberButton onClick={() => handleExportData('audit')} className="text-xs py-1 px-3">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </CyberButton>
              </div>
            </div>
          </HudPanel>

          {/* Audit Logs */}
          <HudPanel className="p-6">
            <div className="space-y-4">
              {filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-[#0d0d14] rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[#161620] text-plasma">
                        {log.action.includes('CREATE') && <Plus className="w-4 h-4" />}
                        {log.action.includes('SCHEDULE') && <Calendar className="w-4 h-4" />}
                        {log.action.includes('COMPLETE') && <CheckCircle className="w-4 h-4" />}
                        {log.action.includes('EXPORT') && <Download className="w-4 h-4" />}
                        {!log.action.includes('CREATE') && 
                         !log.action.includes('SCHEDULE') && 
                         !log.action.includes('COMPLETE') && 
                         !log.action.includes('EXPORT') && <Activity className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-bold">{log.action.replace(/_/g, ' ')}</h3>
                        <p className="text-sm text-gray-400">{log.performedBy}</p>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="text-sm text-gray-400">{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-gray-300">{log.details}</p>
                  {log.metadata && log.metadata.transactionHash && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Transaction:</span>
                      <a 
                        href={`https://etherscan.io/tx/${log.metadata.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-plasma hover:underline flex items-center"
                      >
                        {log.metadata.transactionHash.slice(0, 10)}...{log.metadata.transactionHash.slice(-8)}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </HudPanel>
        </div>
      )}

      {/* Create Profit Pool Modal */}
      {showCreatePoolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Profit Pool</h2>
              <button
                onClick={() => setShowCreatePoolModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pool Name *
                </label>
                <input
                  type="text"
                  value={newPoolForm.name}
                  onChange={(e) => setNewPoolForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="e.g., Q3 2025 Profit Pool"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    value={newPoolForm.totalAmount}
                    onChange={(e) => setNewPoolForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Enter amount"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={newPoolForm.currency}
                    onChange={(e) => setNewPoolForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source *
                </label>
                <input
                  type="text"
                  value={newPoolForm.source}
                  onChange={(e) => setNewPoolForm(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="e.g., Operational Profits, Grant, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPoolForm.description}
                  onChange={(e) => setNewPoolForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Optional description of this profit pool"
                />
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  onClick={handleCreateProfitPool}
                  className="flex-1"
                  disabled={!newPoolForm.name || !newPoolForm.totalAmount || !newPoolForm.source}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pool
                </CyberButton>
                <CyberButton
                  onClick={() => setShowCreatePoolModal(false)}
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

      {/* Create Distribution Modal */}
      {showCreateDistributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Schedule New Distribution</h2>
              <button
                onClick={() => setShowCreateDistributionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profit Pool *
                </label>
                <select
                  value={newDistributionForm.poolId}
                  onChange={(e) => {
                    const selectedPool = profitPools.find(p => p.id === e.target.value);
                    setNewDistributionForm(prev => ({ 
                      ...prev, 
                      poolId: e.target.value,
                      amount: selectedPool ? selectedPool.remainingAmount.toString() : ''
                    }));
                  }}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  required
                >
                  <option value="">Select a profit pool</option>
                  {profitPools
                    .filter(pool => pool.status === 'active' && pool.remainingAmount > 0)
                    .map(pool => (
                      <option key={pool.id} value={pool.id}>
                        {pool.name} ({formatCurrency(pool.remainingAmount, pool.currency)} available)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Distribution Amount *
                  </label>
                  <input
                    type="number"
                    value={newDistributionForm.amount}
                    onChange={(e) => setNewDistributionForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Enter amount"
                    min="0"
                    step="1000"
                    required
                  />
                  {newDistributionForm.poolId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Maximum: {formatCurrency(
                        profitPools.find(p => p.id === newDistributionForm.poolId)?.remainingAmount || 0
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Distribution Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={newDistributionForm.distributionDate}
                    onChange={(e) => setNewDistributionForm(prev => ({ ...prev, distributionDate: e.target.value }))}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Distribution Type
                  </label>
                  <select
                    value={newDistributionForm.distributionType}
                    onChange={(e) => setNewDistributionForm(prev => ({ ...prev, distributionType: e.target.value }))}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  >
                    <option value="regular">Regular (Quarterly)</option>
                    <option value="special">Special (One-time)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Distribution Rule *
                  </label>
                  <select
                    value={newDistributionForm.ruleId}
                    onChange={(e) => setNewDistributionForm(prev => ({ ...prev, ruleId: e.target.value }))}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    required
                  >
                    <option value="">Select a distribution rule</option>
                    {distributionRules
                      .filter(rule => rule.status === 'active')
                      .map(rule => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name}{rule.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newDistributionForm.notes}
                  onChange={(e) => setNewDistributionForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Optional notes about this distribution"
                />
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  onClick={handlePreviewDistribution}
                  className="flex-1"
                  disabled={!newDistributionForm.poolId || !newDistributionForm.amount || !newDistributionForm.distributionDate || !newDistributionForm.ruleId}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Distribution
                </CyberButton>
                <CyberButton
                  onClick={() => setShowCreateDistributionModal(false)}
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

      {/* Create Rule Modal */}
      {showCreateRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Distribution Rule</h2>
              <button
                onClick={() => setShowCreateRuleModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={newRuleForm.name}
                  onChange={(e) => setNewRuleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="e.g., Standard Token Balance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={newRuleForm.description}
                  onChange={(e) => setNewRuleForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Describe how this rule works"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Distribution Formula *
                </label>
                <select
                  value={newRuleForm.formula}
                  onChange={(e) => setNewRuleForm(prev => ({ ...prev, formula: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  required
                >
                  <option value="token_balance">Standard Token Balance</option>
                  <option value="token_balance * (investment_tier == 'institutional' ? 1.1 : 1.0)">Institutional Investor Bonus</option>
                  <option value="token_balance * (first_transaction_date < '2025-02-01' ? 1.05 : 1.0)">Early Investor Bonus</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  This determines how profits are allocated among participants
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Token Requirement
                  </label>
                  <input
                    type="number"
                    value={newRuleForm.minTokens}
                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, minTokens: e.target.value }))}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum tokens required to be eligible for distribution
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRuleForm.isDefault}
                      onChange={(e) => setNewRuleForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                    />
                    <span className="text-sm font-medium text-gray-300">Set as default rule</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  onClick={handleCreateRule}
                  className="flex-1"
                  disabled={!newRuleForm.name || !newRuleForm.description || !newRuleForm.formula}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Rule
                </CyberButton>
                <CyberButton
                  onClick={() => setShowCreateRuleModal(false)}
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

      {/* Distribution Preview Modal */}
      {showDistributionPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Distribution Preview</h2>
              <button
                onClick={() => setShowDistributionPreviewModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Total Amount</p>
                  <p className="text-lg font-bold text-plasma">{formatCurrency(distributionPreview.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Eligible Participants</p>
                  <p className="text-lg font-bold text-plasma">{distributionPreview.participantCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Distribution Date</p>
                  <p className="text-lg font-bold text-plasma">{new Date(newDistributionForm.distributionDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Participant</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Wallet Address</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Token Balance</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Allocation %</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Allocation Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributionPreview.participants.map((participant, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                        <td className="py-3 px-4">
                          <span className="font-medium">{participant.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">
                            {participant.walletAddress.slice(0, 6)}...{participant.walletAddress.slice(-4)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{participant.tokenBalance.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatPercentage(participant.allocationPercentage)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatCurrency(participant.allocationAmount)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex space-x-4">
                <CyberButton
                  onClick={() => {
                    handleCreateDistribution();
                    setShowDistributionPreviewModal(false);
                  }}
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Distribution
                </CyberButton>
                <CyberButton
                  onClick={() => setShowDistributionPreviewModal(false)}
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

export default AdminProfitSharingPage;