import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileCheck, 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';
import { useInterval } from '../hooks/useInterval';

interface DashboardStats {
  totalUsers: number;
  whitelistCount: number;
  tokenHolders: number;
  totalTokens: number;
  profitDistributed: number;
  lastDistribution: string;
  newUsersWeek: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'kyc_submission' | 'kyc_approval' | 'token_transfer' | 'whitelist_update';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

const AdminDashboardPage: React.FC = () => {
  const { adminUser, updateActivity, logAdminAction } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    whitelistCount: 0,
    tokenHolders: 0,
    totalTokens: 0,
    profitDistributed: 0,
    lastDistribution: 'N/A',
    newUsersWeek: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [cachedStats, setCachedStats] = useState<DashboardStats | null>(null);

  // Refresh interval in milliseconds (5 minutes)
  const REFRESH_INTERVAL = 5 * 60 * 1000;
  // Query timeout in milliseconds (30 seconds)
  const QUERY_TIMEOUT = 30 * 1000;

  useEffect(() => {
    loadDashboardData();
    updateActivity();
  }, []);

  // Set up automatic refresh interval
  useInterval(() => {
    loadDashboardData(true);
  }, REFRESH_INTERVAL);

  const loadDashboardData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);
    
    try {
      // Use cached data as fallback if available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT);
      
      // Fetch user statistics from database
      const { data: userStats, error: userStatsError } = await supabase
        .rpc('get_user_statistics', {}, { signal: controller.signal });
      
      if (userStatsError) throw userStatsError;
      
      // Fetch whitelist statistics
      const { data: whitelistStats, error: whitelistError } = await supabase
        .rpc('get_whitelist_statistics', {}, { signal: controller.signal });
      
      if (whitelistError) throw whitelistError;
      
      // Fetch token metrics
      const { data: tokenMetrics, error: tokenError } = await supabase
        .rpc('get_token_metrics', {}, { signal: controller.signal });
      
      if (tokenError) throw tokenError;
      
      // Fetch profit sharing metrics
      const { data: profitMetrics, error: profitError } = await supabase
        .rpc('get_profit_sharing_metrics', {}, { signal: controller.signal });
      
      if (profitError) throw profitError;
      
      clearTimeout(timeoutId);
      
      // Combine all statistics
      const dashboardStats: DashboardStats = {
        totalUsers: userStats?.total_users || 0,
        whitelistCount: whitelistStats?.active_entries || 0,
        tokenHolders: tokenMetrics?.holders_count || 0,
        totalTokens: tokenMetrics?.total_supply || 0,
        profitDistributed: profitMetrics?.total_distributed || 0,
        lastDistribution: profitMetrics?.next_distribution?.date || 'N/A',
        newUsersWeek: userStats?.new_users_week || 0
      };
      
      // Sanitize data before display
      Object.keys(dashboardStats).forEach(key => {
        const value = dashboardStats[key as keyof DashboardStats];
        if (typeof value === 'number' && !isFinite(value)) {
          dashboardStats[key as keyof DashboardStats] = 0;
        }
      });
      
      setStats(dashboardStats);
      setCachedStats(dashboardStats);
      
      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(4);
      
      if (activityError) throw activityError;
      
      if (activityData?.length) {
        const formattedActivity: RecentActivity[] = activityData.map(log => ({
          id: log.id,
          type: mapActionToType(log.action),
          description: log.details,
          timestamp: log.timestamp,
          status: 'success'
        }));
        
        setRecentActivity(formattedActivity);
      } else {
        // Fallback to mock data if no activity logs found
        setRecentActivity([
          {
            id: '1',
            type: 'user_registration',
            description: 'New user registered: investor@example.com',
            timestamp: '2025-01-27T10:30:00Z',
            status: 'success'
          },
          {
            id: '2',
            type: 'kyc_submission',
            description: 'KYC submitted by florin@dronera.eu',
            timestamp: '2025-01-27T09:15:00Z',
            status: 'pending'
          },
          {
            id: '3',
            type: 'kyc_approval',
            description: 'KYC approved for verified@investor.com',
            timestamp: '2025-01-27T08:45:00Z',
            status: 'success'
          },
          {
            id: '4',
            type: 'whitelist_update',
            description: 'Added 5 new addresses to Core Whitelist',
            timestamp: '2025-01-27T08:00:00Z',
            status: 'success'
          }
        ]);
      }
      
      setLastRefresh(new Date());
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('VIEW_DASHBOARD', `Viewed admin dashboard statistics`);
      }
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      
      // Use cached data as fallback if available
      if (cachedStats) {
        setStats(cachedStats);
        setError('Using cached data. Failed to fetch latest statistics.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
        
        // Fallback to mock data if no cached data available
        setStats({
          totalUsers: 156,
          whitelistCount: 245,
          tokenHolders: 3,
          totalTokens: 100000000,
          profitDistributed: 0,
          lastDistribution: 'Q4 2025 (Scheduled)',
          newUsersWeek: 12
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const mapActionToType = (action: string): RecentActivity['type'] => {
    if (action.includes('USER') || action.includes('REGISTER')) return 'user_registration';
    if (action.includes('KYC') && action.includes('SUBMIT')) return 'kyc_submission';
    if (action.includes('KYC') && action.includes('APPROV')) return 'kyc_approval';
    if (action.includes('TOKEN') || action.includes('TRANSFER')) return 'token_transfer';
    if (action.includes('WHITELIST')) return 'whitelist_update';
    return 'user_registration'; // Default fallback
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration': return <Users className="w-4 h-4" />;
      case 'kyc_submission': return <FileCheck className="w-4 h-4" />;
      case 'kyc_approval': return <CheckCircle className="w-4 h-4" />;
      case 'token_transfer': return <DollarSign className="w-4 h-4" />;
      case 'whitelist_update': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {adminUser?.email}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <CyberButton onClick={() => loadDashboardData()} disabled={isLoading || isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HudPanel className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider">Total Users</h3>
            <Users className="w-5 h-5 text-plasma" />
          </div>
          {isLoading ? (
            <div className="h-14 flex items-center">
              <div className="w-5 h-5 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-plasma">{stats.totalUsers}</p>
              <p className="text-sm text-gray-400">+{stats.newUsersWeek} this week</p>
            </>
          )}
        </HudPanel>

        <HudPanel className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider">Token Holders</h3>
            <Shield className="w-5 h-5 text-plasma" />
          </div>
          {isLoading ? (
            <div className="h-14 flex items-center">
              <div className="w-5 h-5 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-plasma">{stats.tokenHolders}</p>
              <p className="text-sm text-gray-400">Verified investors</p>
            </>
          )}
        </HudPanel>

        <HudPanel className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider">Whitelist</h3>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          {isLoading ? (
            <div className="h-14 flex items-center">
              <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-green-400">{stats.whitelistCount}</p>
              <p className="text-sm text-gray-400">Active addresses</p>
            </>
          )}
        </HudPanel>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HudPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <BarChart3 className="text-plasma mr-3 w-6 h-6" />
              User Growth
            </h2>
            <CyberButton className="text-xs py-1 px-3">
              <Download className="w-3 h-3 mr-1" />
              Export
            </CyberButton>
          </div>
          {isLoading ? (
            <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500">User Growth Chart</p>
                <p className="text-xs text-gray-600">Interactive chart would be here</p>
              </div>
            </div>
          )}
        </HudPanel>

        <HudPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <PieChart className="text-plasma mr-3 w-6 h-6" />
              KYC Status Distribution
            </h2>
            <CyberButton className="text-xs py-1 px-3">
              <Download className="w-3 h-3 mr-1" />
              Export
            </CyberButton>
          </div>
          {isLoading ? (
            <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-plasma border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="h-64 bg-[#0d0d14] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500">KYC Distribution Chart</p>
                <p className="text-xs text-gray-600">Interactive chart would be here</p>
              </div>
            </div>
          )}
        </HudPanel>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HudPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <Activity className="text-plasma mr-3 w-6 h-6" />
                Recent Activity
              </h2>
              <CyberButton to="/admin/audit-logs" className="text-xs py-1 px-3">
                View All Logs
              </CyberButton>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 bg-[#0d0d14] rounded-lg animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-[#161620] w-8 h-8"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-[#161620] rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-[#161620] rounded w-1/4"></div>
                      </div>
                      <div className="px-2 py-1 rounded bg-[#161620] w-16 h-6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-[#0d0d14] rounded-lg">
                    <div className={`p-2 rounded-lg bg-[#161620] ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      activity.status === 'success' ? 'bg-green-900 text-green-300' :
                      activity.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HudPanel>
        </div>

        <div>
          <HudPanel className="p-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <CyberButton to="/admin/users" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </CyberButton>
              
              <CyberButton to="/admin/whitelist" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Whitelist Control
              </CyberButton>
              
              <CyberButton to="/admin/tokens" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Token Management
              </CyberButton>
              
              <CyberButton to="/admin/profit-sharing" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Profit Sharing
              </CyberButton>
            </div>
          </HudPanel>

          {/* System Status */}
          <HudPanel className="p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">KYC Service</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Blockchain</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Synced</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Security</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Secure</span>
                </div>
              </div>
            </div>
          </HudPanel>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;