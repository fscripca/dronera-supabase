import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Filter,
  Download,
  RefreshCw,
  Search
} from 'lucide-react';
import HudPanel from './HudPanel';
import CyberButton from './CyberButton';
import { supabase } from '../lib/supabase';
import { useInterval } from '../hooks/useInterval';

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing' | 'deposit' | 'withdrawal';
  amount: number;
  tokenType: 'ETH' | 'DRONE' | 'EUR';
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  hash?: string;
  from?: string;
  to?: string;
  description?: string;
}

interface TransactionHistoryProps {
  walletAddress: string;
  userId?: string;
  isCorrectNetwork: boolean;
  onRefresh?: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  walletAddress, 
  userId, 
  isCorrectNetwork,
  onRefresh 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing' | 'deposit' | 'withdrawal'>('all');
  const [filterToken, setFilterToken] = useState<'all' | 'ETH' | 'DRONE' | 'EUR'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load transactions on component mount and when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadTransactionHistory();
    }
  }, [walletAddress, userId]);

  // Apply filters when transactions or filter settings change
  useEffect(() => {
    applyFilters();
  }, [transactions, filterType, filterToken, searchTerm]);

  // Set up auto-refresh interval (every 10 seconds)
  useInterval(() => {
    if (walletAddress) {
      loadTransactionHistory(true);
    }
  }, 10000);

  // Load transaction history
  const loadTransactionHistory = async (silent = false) => {
    if (!walletAddress && !userId) return;
    
    if (!silent) {
      setIsLoading(true);
    }
    
    try {
      setError(null);
      
      // Build the or condition dynamically to avoid undefined UUID issues
      const orConditions = [];
      
      // Only add user_id condition if userId is defined and not undefined
      if (userId && userId !== 'undefined') {
        orConditions.push(`user_id.eq.${userId}`);
      }
      
      // Add wallet address conditions if walletAddress is provided
      if (walletAddress) {
        orConditions.push(`from_address.eq.${walletAddress}`);
        orConditions.push(`to_address.eq.${walletAddress}`);
      }
      
      // If no valid conditions, return empty array
      if (orConditions.length === 0) {
        setTransactions([]);
        setLastUpdated(new Date());
        return;
      }
      
      // Fetch transactions from Supabase
      const { data: walletTransactions, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .or(orConditions.join(','))
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching wallet transactions:', error);
        throw error;
      }

      // Transform database transactions to match our interface
      const transformedTransactions: Transaction[] = (walletTransactions || []).map(tx => ({
        id: tx.id,
        type: tx.type as 'incoming' | 'outgoing' | 'deposit' | 'withdrawal',
        amount: parseFloat(tx.amount),
        tokenType: tx.token_type as 'ETH' | 'DRONE' | 'EUR',
        timestamp: tx.created_at,
        status: tx.status as 'completed' | 'pending' | 'failed',
        hash: tx.transaction_hash,
        from: tx.from_address,
        to: tx.to_address,
        description: tx.description
      }));

      setTransactions(transformedTransactions);
      setLastUpdated(new Date());
      
      // Call onRefresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      setError('Failed to load transactions. Please try again.');
      setTransactions([]);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  // Apply filters to transactions
  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }
    
    // Apply token filter
    if (filterToken !== 'all') {
      filtered = filtered.filter(tx => tx.tokenType === filterToken);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format amount
  const formatAmount = (amount: number, tokenType: string) => {
    if (tokenType === 'ETH') {
      return `${amount} ETH`;
    } else if (tokenType === 'EUR') {
      return `€${amount.toLocaleString()}`;
    } else {
      return `${amount.toLocaleString()} DRONE`;
    }
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'incoming':
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'outgoing':
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-yellow-400" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['Type', 'Amount', 'Token', 'Date', 'Status', 'Transaction Hash', 'Description'].join(','),
      ...filteredTransactions.map(tx => [
        tx.type,
        tx.amount.toString(),
        tx.tokenType,
        new Date(tx.timestamp).toLocaleString(),
        tx.status,
        tx.hash || '',
        tx.description || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-1 rounded text-sm focus:ring-plasma focus:border-plasma w-48"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
            >
              <option value="all">All Types</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
          
          <select
            value={filterToken}
            onChange={(e) => setFilterToken(e.target.value as any)}
            className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
          >
            <option value="all">All Tokens</option>
            <option value="ETH">ETH</option>
            <option value="DRONE">DRONE</option>
            <option value="EUR">EUR</option>
          </select>
          
          <CyberButton 
            className="text-xs py-1 px-3"
            onClick={() => loadTransactionHistory()}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Refresh
          </CyberButton>
          
          <CyberButton className="text-xs py-1 px-3" onClick={handleExport}>
            <Download className="w-3 h-3 mr-1" />
            Export
          </CyberButton>
        </div>
      </div>
      
      <HudPanel className="p-6">
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-plasma mx-auto mb-2 animate-spin" />
            <p className="text-gray-400">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#161620] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Transactions Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {!isCorrectNetwork 
                ? "Please connect to the Base network to view your transactions." 
                : "Your transaction history will appear here once you start using your wallet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getTransactionTypeIcon(tx.type)}
                        <span className="ml-2 capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center">
                        <span className={
                          (tx.type === 'incoming' || tx.type === 'deposit') 
                            ? 'text-green-400' 
                            : 'text-yellow-400'
                        }>
                          {(tx.type === 'incoming' || tx.type === 'deposit') ? '+' : '-'} {formatAmount(tx.amount, tx.tokenType)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(tx.status)}
                        <span className="ml-2 capitalize">{tx.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {tx.hash ? (
                        <a 
                          href={`https://basescan.org/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-plasma hover:underline flex items-center"
                        >
                          <span className="font-mono text-xs">
                            {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                          </span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {tx.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-right text-xs text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </HudPanel>
    </div>
  );
};

export default TransactionHistory;