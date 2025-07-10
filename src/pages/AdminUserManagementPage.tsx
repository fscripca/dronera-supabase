import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus, 
  Download, 
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Calendar,
  Activity,
  Ban,
  UserCheck,
  X,
  Save
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface User {
  id: string;
  email: string;
  status: 'active' | 'suspended' | 'pending' | 'banned';
  registrationDate: string;
  lastActivity: string;
  tokenBalance: number;
  investmentAmount: number;
  walletAddress?: string;
  profileData?: {
    firstName?: string;
    lastName?: string;
    country?: string;
    phone?: string;
  };
  riskScore?: number;
  notes?: string;
}

interface UserFilters {
  status: 'all' | 'active' | 'suspended' | 'pending' | 'banned';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

const AdminUserManagementPage: React.FC = () => {
  const { adminUser, logAdminAction } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState<'email' | 'registrationDate' | 'lastActivity' | 'investmentAmount'>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    status: 'active' as User['status'],
    notes: ''
  });

  // Edit user form state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    status: 'active' as User['status'],
    notes: '',
    riskScore: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filters, sortBy, sortOrder]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from Supabase
      // For now, using mock data with realistic user scenarios
      const mockUsers: User[] = [
        {
          id: 'user-001',
          email: 'florin@dronera.eu',
          status: 'active',
          registrationDate: '2025-01-15T10:30:00Z',
          lastActivity: '2025-01-27T14:20:00Z',
          tokenBalance: 125000,
          investmentAmount: 187500,
          walletAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
          profileData: {
            firstName: 'Florin',
            lastName: 'Scripcă',
            country: 'Romania',
            phone: '+40 123 456 789'
          },
          riskScore: 95,
          notes: 'Co-founder and CFO. High-value investor with excellent compliance record.'
        },
        {
          id: 'user-002',
          email: 'investor@example.com',
          status: 'active',
          registrationDate: '2025-01-20T09:15:00Z',
          lastActivity: '2025-01-27T11:45:00Z',
          tokenBalance: 0,
          investmentAmount: 0,
          walletAddress: '0x8ba1f109551bD432803012645Hac136c0532925a',
          profileData: {
            firstName: 'John',
            lastName: 'Smith',
            country: 'United States',
            phone: '+1 555 123 4567'
          },
          riskScore: 75,
          notes: 'Potential high-value investor. KYC documents under review.'
        },
        {
          id: 'user-003',
          email: 'test.user@gmail.com',
          status: 'suspended',
          registrationDate: '2025-01-18T16:22:00Z',
          lastActivity: '2025-01-25T08:30:00Z',
          tokenBalance: 0,
          investmentAmount: 0,
          profileData: {
            firstName: 'Jane',
            lastName: 'Doe',
            country: 'Canada',
            phone: '+1 416 555 0123'
          },
          riskScore: 45,
          notes: 'Account suspended due to failed KYC verification. Multiple document inconsistencies detected.'
        },
        {
          id: 'user-004',
          email: 'premium.investor@wealth.com',
          status: 'active',
          registrationDate: '2025-01-10T12:00:00Z',
          lastActivity: '2025-01-27T16:15:00Z',
          tokenBalance: 500000,
          investmentAmount: 750000,
          walletAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          profileData: {
            firstName: 'Alexander',
            lastName: 'Petrov',
            country: 'Switzerland',
            phone: '+41 44 123 4567'
          },
          riskScore: 98,
          notes: 'Premium institutional investor. Excellent track record and compliance history.'
        },
        {
          id: 'user-005',
          email: 'newbie@startup.io',
          status: 'pending',
          registrationDate: '2025-01-26T14:30:00Z',
          lastActivity: '2025-01-26T14:35:00Z',
          tokenBalance: 0,
          investmentAmount: 0,
          profileData: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            country: 'United Kingdom',
            phone: '+44 20 7123 4567'
          },
          riskScore: 60,
          notes: 'New registration. Awaiting email verification and KYC initiation.'
        }
      ];

      setUsers(mockUsers);
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('VIEW_USERS', `Loaded ${mockUsers.length} users`);
      }
      
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profileData?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profileData?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
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
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(user => 
        new Date(user.registrationDate) >= filterDate
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'registrationDate':
          aValue = new Date(a.registrationDate);
          bValue = new Date(b.registrationDate);
          break;
        case 'lastActivity':
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
        case 'investmentAmount':
          aValue = a.investmentAmount;
          bValue = b.investmentAmount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    try {
      // In production, this would create user in Supabase Auth and profiles table
      const userId = `user-${Date.now()}`;
      const user: User = {
        id: userId,
        email: newUser.email,
        status: newUser.status,
        registrationDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        tokenBalance: 0,
        investmentAmount: 0,
        profileData: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          country: newUser.country,
          phone: newUser.phone
        },
        riskScore: 50,
        notes: newUser.notes
      };

      setUsers(prev => [user, ...prev]);
      setShowAddUserModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        country: '',
        phone: '',
        status: 'active',
        notes: ''
      });

      if (logAdminAction) {
        await logAdminAction('CREATE_USER', `Created new user: ${newUser.email}`);
      }
      
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const updatedUser = {
        ...editingUser,
        status: editForm.status,
        notes: editForm.notes,
        riskScore: editForm.riskScore
      };

      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));

      setEditingUser(null);
      setSelectedUser(updatedUser);

      if (logAdminAction) {
        await logAdminAction('UPDATE_USER', `Updated user: ${editingUser.email} - Status: ${editForm.status}`);
      }
      
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUser(null);
      setShowUserModal(false);

      if (logAdminAction) {
        await logAdminAction('DELETE_USER', `Deleted user: ${email}`);
      }
      
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
    if (bulkSelection.length === 0) return;

    const confirmMessage = `Are you sure you want to ${action} ${bulkSelection.length} selected users?`;
    if (!confirm(confirmMessage)) return;

    try {
      if (action === 'delete') {
        setUsers(prev => prev.filter(user => !bulkSelection.includes(user.id)));
      } else {
        const newStatus = action === 'suspend' ? 'suspended' : 'active';
        setUsers(prev => prev.map(user => 
          bulkSelection.includes(user.id) 
            ? { ...user, status: newStatus as User['status'] }
            : user
        ));
      }

      setBulkSelection([]);
      setShowBulkActions(false);

      if (logAdminAction) {
        await logAdminAction('BULK_ACTION', `${action} applied to ${bulkSelection.length} users`);
      }
      
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const handleExportUsers = async () => {
    try {
      const csvContent = [
        ['Email', 'Status', 'KYC Status', 'Registration Date', 'Token Balance', 'Investment Amount', 'Risk Score'].join(','),
        ...filteredUsers.map(user => [
          user.email,
          user.status,
          user.kycStatus,
          user.registrationDate,
          user.tokenBalance,
          user.investmentAmount,
          user.riskScore || 0
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dronera-users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (logAdminAction) {
        await logAdminAction('EXPORT_USERS', `Exported ${filteredUsers.length} users to CSV`);
      }
      
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'suspended': return <Ban className="w-4 h-4 text-yellow-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'banned': return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900';
      case 'suspended': return 'text-yellow-400 bg-yellow-900';
      case 'pending': return 'text-blue-400 bg-blue-900';
      case 'banned': return 'text-red-400 bg-red-900';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-400">Manage user accounts, status, and permissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <CyberButton onClick={handleExportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </CyberButton>
          <CyberButton onClick={() => setShowAddUserModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </CyberButton>
          <CyberButton onClick={loadUsers} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
        </div>
      </div>

      {/* Filters and Search */}
      <HudPanel className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="banned">Banned</option>
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
              <option value="year">This Year</option>
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
              <option value="registrationDate">Registration Date</option>
              <option value="email">Email</option>
              <option value="lastActivity">Last Activity</option>
              <option value="investmentAmount">Investment Amount</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-plasma hover:text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </HudPanel>

      {/* Bulk Actions */}
      {bulkSelection.length > 0 && (
        <HudPanel className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              {bulkSelection.length} users selected
            </span>
            <div className="flex space-x-2">
              <CyberButton 
                onClick={() => handleBulkAction('activate')}
                className="text-xs py-1 px-3"
              >
                <UserCheck className="w-3 h-3 mr-1" />
                Activate
              </CyberButton>
              <CyberButton 
                onClick={() => handleBulkAction('suspend')}
                className="text-xs py-1 px-3"
                variant="red"
              >
                <Ban className="w-3 h-3 mr-1" />
                Suspend
              </CyberButton>
              <CyberButton 
                onClick={() => handleBulkAction('delete')}
                className="text-xs py-1 px-3"
                variant="red"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </CyberButton>
              <CyberButton 
                onClick={() => setBulkSelection([])}
                className="text-xs py-1 px-3"
              >
                Clear
              </CyberButton>
            </div>
          </div>
        </HudPanel>
      )}

      {/* Users Table */}
      <HudPanel className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plasma mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-2">
                    <input
                      type="checkbox"
                      checked={bulkSelection.length === filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkSelection(filteredUsers.map(u => u.id));
                        } else {
                          setBulkSelection([]);
                        }
                      }}
                      className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Investment</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Risk Score</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Activity</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={bulkSelection.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelection(prev => [...prev, user.id]);
                          } else {
                            setBulkSelection(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {user.profileData?.firstName && (
                          <p className="text-sm text-gray-400">
                            {user.profileData.firstName} {user.profileData.lastName}
                          </p>
                        )}
                        {user.walletAddress && (
                          <p className="text-xs text-gray-500 font-mono">
                            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{formatCurrency(user.investmentAmount)}</p>
                        <p className="text-sm text-gray-400">{user.tokenBalance.toLocaleString()} DRONE</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.riskScore && (
                        <span className={`font-bold ${getRiskScoreColor(user.riskScore)}`}>
                          {user.riskScore}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{formatDate(user.lastActivity)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-plasma hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setEditForm({
                              status: user.status,
                              notes: user.notes || '',
                              riskScore: user.riskScore || 0
                            });
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HudPanel>

      {/* User Details Modal */}
      {selectedUser && showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-bold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  
                  {selectedUser.profileData?.firstName && (
                    <div>
                      <label className="text-sm text-gray-400">Full Name</label>
                      <p className="font-medium">
                        {selectedUser.profileData.firstName} {selectedUser.profileData.lastName}
                      </p>
                    </div>
                  )}

                  {selectedUser.profileData?.country && (
                    <div>
                      <label className="text-sm text-gray-400">Country</label>
                      <p className="font-medium">{selectedUser.profileData.country}</p>
                    </div>
                  )}

                  {selectedUser.profileData?.phone && (
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <p className="font-medium">{selectedUser.profileData.phone}</p>
                    </div>
                  )}

                  {selectedUser.walletAddress && (
                    <div>
                      <label className="text-sm text-gray-400">Wallet Address</label>
                      <p className="font-mono text-sm bg-[#0d0d14] p-2 rounded">
                        {selectedUser.walletAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-xl font-bold mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Account Status</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedUser.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {selectedUser.riskScore && (
                    <div className="flex items-center justify-between">
                      <span>Risk Score</span>
                      <span className={`font-bold ${getRiskScoreColor(selectedUser.riskScore)}`}>
                        {selectedUser.riskScore}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Registration Date</span>
                    <span>{formatDate(selectedUser.registrationDate)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Last Activity</span>
                    <span>{formatDate(selectedUser.lastActivity)}</span>
                  </div>
                </div>
              </div>

              {/* Investment Information */}
              <div>
                <h3 className="text-xl font-bold mb-4">Investment Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Investment</span>
                    <span className="font-bold text-plasma">
                      {formatCurrency(selectedUser.investmentAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>DRONE Token Balance</span>
                    <span className="font-bold text-plasma">
                      {selectedUser.tokenBalance.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Token Value</span>
                    <span className="font-medium">
                      {formatCurrency(selectedUser.tokenBalance * 1.5)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-xl font-bold mb-4">Admin Notes</h3>
                {selectedUser.notes ? (
                  <div className="bg-[#0d0d14] p-4 rounded border-l-2 border-plasma">
                    <p className="text-gray-300">{selectedUser.notes}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No notes available</p>
                )}
              </div>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={newUser.country}
                  onChange={(e) => setNewUser(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Status
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={newUser.notes}
                  onChange={(e) => setNewUser(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Optional notes about this user..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <CyberButton
                onClick={handleAddUser}
                className="flex-1"
                disabled={!newUser.email || !newUser.password}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </CyberButton>
              <CyberButton
                onClick={() => setShowAddUserModal(false)}
                variant="red"
                className="px-6"
              >
                Cancel
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit User</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Email
                </label>
                <p className="text-gray-400 bg-[#0d0d14] p-2 rounded">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Risk Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.riskScore}
                  onChange={(e) => setEditForm(prev => ({ ...prev, riskScore: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Add notes about this user..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <CyberButton
                onClick={handleUpdateUser}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </CyberButton>
              <CyberButton
                onClick={() => setEditingUser(null)}
                variant="red"
                className="px-6"
              >
                Cancel
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;