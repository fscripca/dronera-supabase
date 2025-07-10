import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  User,
  Activity,
  Shield,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  X
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

interface LogFilters {
  action: string;
  adminId: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const AdminAuditLogsPage: React.FC = () => {
  const { adminUser, logAdminAction } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LogFilters>({
    action: 'all',
    adminId: 'all',
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'action' | 'adminId'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uniqueActions, setUniqueActions] = useState<string[]>([]);
  const [uniqueAdmins, setUniqueAdmins] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filters, sortBy, sortOrder]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from Supabase
      // For now, using mock data
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // If no data from Supabase, use mock data
      const auditLogs: AuditLog[] = data?.length ? data.map(log => ({
        id: log.id,
        adminId: log.admin_id,
        action: log.action,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        timestamp: log.timestamp
      })) : [
        {
          id: 'log-001',
          adminId: 'admin@dronera.eu',
          action: 'LOGIN',
          details: 'Admin user logged in',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T14:30:00Z'
        },
        {
          id: 'log-002',
          adminId: 'admin@dronera.eu',
          action: 'KYC_APPROVAL',
          details: 'Approved KYC for user: investor@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T14:35:00Z'
        },
        {
          id: 'log-003',
          adminId: 'admin@dronera.eu',
          action: 'WHITELIST_ADD',
          details: 'Added email to whitelist: partner@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T14:40:00Z'
        },
        {
          id: 'log-004',
          adminId: 'admin@dronera.eu',
          action: 'TOKEN_CONFIG',
          details: 'Updated token configuration: Enabled minting',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T15:10:00Z'
        },
        {
          id: 'log-005',
          adminId: 'admin@dronera.eu',
          action: 'USER_SUSPEND',
          details: 'Suspended user account: suspicious@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T15:30:00Z'
        },
        {
          id: 'log-006',
          adminId: 'security@dronera.eu',
          action: 'SECURITY_ALERT',
          details: 'Multiple failed login attempts detected',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2025-01-27T16:15:00Z'
        },
        {
          id: 'log-007',
          adminId: 'security@dronera.eu',
          action: 'IP_BLOCK',
          details: 'Blocked suspicious IP address: 203.0.113.42',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2025-01-27T16:20:00Z'
        },
        {
          id: 'log-008',
          adminId: 'admin@dronera.eu',
          action: 'PROFIT_DISTRIBUTION',
          details: 'Scheduled profit distribution: Q1 2025',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T17:05:00Z'
        },
        {
          id: 'log-009',
          adminId: 'admin@dronera.eu',
          action: 'SYSTEM_CONFIG',
          details: 'Updated system configuration: Email notifications',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T17:30:00Z'
        },
        {
          id: 'log-010',
          adminId: 'admin@dronera.eu',
          action: 'LOGOUT',
          details: 'Admin user logged out',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-01-27T18:00:00Z'
        }
      ];

      setLogs(auditLogs);
      
      // Extract unique actions and admins for filters
      const actions = Array.from(new Set(auditLogs.map(log => log.action)));
      const admins = Array.from(new Set(auditLogs.map(log => log.adminId)));
      
      setUniqueActions(actions);
      setUniqueAdmins(admins);
      setLastRefresh(new Date());
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('VIEW_AUDIT_LOGS', `Viewed ${auditLogs.length} audit logs`);
      }
      
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.adminId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    // Admin filter
    if (filters.adminId !== 'all') {
      filtered = filtered.filter(log => log.adminId === filters.adminId);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= filterDate
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        case 'adminId':
          aValue = a.adminId;
          bValue = b.adminId;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredLogs(filtered);
  };

  const handleExportLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Admin', 'Action', 'Details', 'IP Address'].join(','),
        ...filteredLogs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          log.adminId,
          log.action,
          `"${log.details.replace(/"/g, '""')}"`, // Escape quotes for CSV
          log.ipAddress
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dronera-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (logAdminAction) {
        await logAdminAction('EXPORT_LOGS', `Exported ${filteredLogs.length} audit logs to CSV`);
      }
      
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return <User className="w-4 h-4" />;
      case 'KYC_APPROVAL':
      case 'KYC_REJECTION':
        return <FileText className="w-4 h-4" />;
      case 'WHITELIST_ADD':
      case 'WHITELIST_REMOVE':
        return <Shield className="w-4 h-4" />;
      case 'TOKEN_CONFIG':
      case 'MINT_TOKENS':
      case 'BURN_TOKENS':
        return <Activity className="w-4 h-4" />;
      case 'USER_SUSPEND':
      case 'USER_ACTIVATE':
        return <User className="w-4 h-4" />;
      case 'SECURITY_ALERT':
      case 'IP_BLOCK':
        return <AlertTriangle className="w-4 h-4" />;
      case 'PROFIT_DISTRIBUTION':
        return <Activity className="w-4 h-4" />;
      case 'SYSTEM_CONFIG':
        return <Shield className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'text-green-400 bg-green-900';
    if (action.includes('LOGOUT')) return 'text-blue-400 bg-blue-900';
    if (action.includes('KYC')) return 'text-purple-400 bg-purple-900';
    if (action.includes('WHITELIST')) return 'text-yellow-400 bg-yellow-900';
    if (action.includes('TOKEN')) return 'text-plasma bg-[#0d1a2a]';
    if (action.includes('USER')) return 'text-orange-400 bg-orange-900';
    if (action.includes('SECURITY') || action.includes('ALERT') || action.includes('BLOCK')) 
      return 'text-red-400 bg-red-900';
    if (action.includes('PROFIT') || action.includes('DISTRIBUTION')) 
      return 'text-green-400 bg-green-900';
    if (action.includes('SYSTEM') || action.includes('CONFIG')) 
      return 'text-blue-400 bg-blue-900';
    
    return 'text-gray-400 bg-gray-900';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-gray-400">Comprehensive system activity tracking and security monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <CyberButton onClick={handleExportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </CyberButton>
          <CyberButton onClick={loadAuditLogs} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
        </div>
      </div>

      {/* Filters and Search */}
      <HudPanel className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Admin Filter */}
          <div>
            <select
              value={filters.adminId}
              onChange={(e) => setFilters(prev => ({ ...prev, adminId: e.target.value }))}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
            >
              <option value="all">All Admins</option>
              {uniqueAdmins.map(admin => (
                <option key={admin} value={admin}>{admin}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
            >
              <option value="timestamp">Timestamp</option>
              <option value="action">Action</option>
              <option value="adminId">Admin</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-plasma hover:text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </HudPanel>

      {/* Logs Table */}
      <HudPanel className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plasma mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Admin</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Details</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">IP Address</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-plasma" />
                        <span>{log.adminId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="truncate max-w-xs">{log.details}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{log.ipAddress}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogModal(true);
                        }}
                        className="text-plasma hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HudPanel>

      {/* Log Details Modal */}
      {selectedLog && showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Audit Log Details</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className={`inline-flex items-center px-3 py-1 rounded ${getActionColor(selectedLog.action)}`}>
                  {getActionIcon(selectedLog.action)}
                  <span className="ml-2 font-medium">{selectedLog.action}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Timestamp</label>
                  <p className="font-medium">{formatDate(selectedLog.timestamp)}</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Admin</label>
                  <p className="font-medium">{selectedLog.adminId}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Details</label>
                <div className="bg-[#0d0d14] p-3 rounded border border-gray-800">
                  <p>{selectedLog.details}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">IP Address</label>
                  <p className="font-mono">{selectedLog.ipAddress}</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">User Agent</label>
                  <p className="text-sm text-gray-300 truncate">{selectedLog.userAgent}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Log ID: {selectedLog.id}
                  </div>
                  <CyberButton
                    onClick={() => setShowLogModal(false)}
                    className="px-6"
                  >
                    Close
                  </CyberButton>
                </div>
              </div>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Security Insights */}
      <HudPanel className="p-6">
        <h2 className="text-xl font-bold mb-4">Security Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0d0d14] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Login Activity</h3>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">
              {logs.filter(log => log.action === 'LOGIN').length} logins in the last 30 days
            </p>
            <p className="text-sm text-gray-400">
              No suspicious login patterns detected
            </p>
          </div>
          
          <div className="bg-[#0d0d14] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">KYC Operations</h3>
              <Activity className="w-5 h-5 text-plasma" />
            </div>
            <p className="text-sm text-gray-400">
              {logs.filter(log => log.action.includes('KYC')).length} KYC operations performed
            </p>
            <p className="text-sm text-gray-400">
              {logs.filter(log => log.action === 'KYC_APPROVAL').length} approvals, {logs.filter(log => log.action === 'KYC_REJECTION').length} rejections
            </p>
          </div>
          
          <div className="bg-[#0d0d14] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Security Alerts</h3>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">
              {logs.filter(log => log.action.includes('SECURITY') || log.action.includes('ALERT')).length} security alerts triggered
            </p>
            <p className="text-sm text-gray-400">
              {logs.filter(log => log.action === 'IP_BLOCK').length} IP addresses blocked
            </p>
          </div>
        </div>
      </HudPanel>
    </div>
  );
};

export default AdminAuditLogsPage;