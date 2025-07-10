import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  X,
  Save,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Globe,
  Calendar,
  User,
  Undo2,
  Check,
  Ban
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface WhitelistEntry {
  id: string;
  emailOrDomain: string;
  type: 'email' | 'domain';
  status: 'active' | 'inactive' | 'pending';
  dateAdded: string;
  addedBy: string;
  lastModified?: string;
  modifiedBy?: string;
  notes?: string;
  expiresAt?: string;
  category: 'core' | 'investor' | 'partner' | 'temporary';
  usageCount?: number;
}

interface WhitelistFilters {
  type: 'all' | 'email' | 'domain';
  status: 'all' | 'active' | 'inactive' | 'pending';
  category: 'all' | 'core' | 'investor' | 'partner' | 'temporary';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
  duplicates: number;
}

const AdminWhitelistPage: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WhitelistEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<WhitelistFilters>({
    type: 'all',
    status: 'all',
    category: 'all',
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState<'emailOrDomain' | 'dateAdded' | 'lastModified' | 'usageCount'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WhitelistEntry | null>(null);

  // Form states
  const [newEntry, setNewEntry] = useState({
    emailOrDomain: '',
    type: 'email' as 'email' | 'domain',
    category: 'investor' as WhitelistEntry['category'],
    notes: '',
    expiresAt: ''
  });

  const [editForm, setEditForm] = useState({
    status: 'active' as WhitelistEntry['status'],
    category: 'investor' as WhitelistEntry['category'],
    notes: '',
    expiresAt: ''
  });

  // Upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Undo functionality
  const [recentChanges, setRecentChanges] = useState<Array<{
    id: string;
    action: 'add' | 'edit' | 'delete' | 'bulk';
    timestamp: Date;
    data: any;
  }>>([]);

  useEffect(() => {
    loadWhitelistEntries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [entries, searchTerm, filters, sortBy, sortOrder]);

  const loadWhitelistEntries = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from Supabase
      // For now, using comprehensive mock data
      const mockEntries: WhitelistEntry[] = [
        {
          id: 'wl-001',
          emailOrDomain: 'florin@dronera.eu',
          type: 'email',
          status: 'active',
          dateAdded: '2025-01-15T10:30:00Z',
          addedBy: 'admin@dronera.eu',
          lastModified: '2025-01-20T14:22:00Z',
          modifiedBy: 'admin@dronera.eu',
          notes: 'Co-founder and CFO - permanent whitelist',
          category: 'core',
          usageCount: 15
        },
        {
          id: 'wl-002',
          emailOrDomain: '@dronera.eu',
          type: 'domain',
          status: 'active',
          dateAdded: '2025-01-10T09:00:00Z',
          addedBy: 'admin@dronera.eu',
          notes: 'Company domain - all employees',
          category: 'core',
          usageCount: 8
        },
        {
          id: 'wl-003',
          emailOrDomain: 'investor@example.com',
          type: 'email',
          status: 'active',
          dateAdded: '2025-01-20T16:45:00Z',
          addedBy: 'admin@dronera.eu',
          notes: 'High-value institutional investor',
          category: 'investor',
          usageCount: 3
        },
        {
          id: 'wl-004',
          emailOrDomain: '@venture-capital.com',
          type: 'domain',
          status: 'active',
          dateAdded: '2025-01-18T11:20:00Z',
          addedBy: 'admin@dronera.eu',
          notes: 'Partner VC firm domain',
          category: 'partner',
          usageCount: 12
        },
        {
          id: 'wl-005',
          emailOrDomain: 'temp.user@startup.io',
          type: 'email',
          status: 'pending',
          dateAdded: '2025-01-25T14:30:00Z',
          addedBy: 'admin@dronera.eu',
          notes: 'Temporary access for demo - expires in 7 days',
          category: 'temporary',
          expiresAt: '2025-02-01T14:30:00Z',
          usageCount: 1
        },
        {
          id: 'wl-006',
          emailOrDomain: 'blocked@spam.com',
          type: 'email',
          status: 'inactive',
          dateAdded: '2025-01-22T09:15:00Z',
          addedBy: 'admin@dronera.eu',
          lastModified: '2025-01-26T10:00:00Z',
          modifiedBy: 'admin@dronera.eu',
          notes: 'Deactivated due to suspicious activity',
          category: 'temporary',
          usageCount: 0
        },
        {
          id: 'wl-007',
          emailOrDomain: '@institutional-investors.com',
          type: 'domain',
          status: 'active',
          dateAdded: '2025-01-12T13:45:00Z',
          addedBy: 'admin@dronera.eu',
          notes: 'Major institutional investor domain',
          category: 'investor',
          usageCount: 25
        },
        {
          id: 'wl-008',
          emailOrDomain: 'premium@wealth.fund',
          type: 'email',
          status: 'active',
          dateAdded: '2025-01-08T08:30:00Z',
          addedBy: 'admin@dronera.eu',
          notes: 'Premium wealth fund contact',
          category: 'investor',
          usageCount: 7
        }
      ];

      setEntries(mockEntries);
      
      // Log admin action
      await logAdminAction('VIEW_WHITELIST', `Loaded ${mockEntries.length} whitelist entries`);
      
    } catch (error) {
      console.error('Failed to load whitelist entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.emailOrDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.addedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(entry => entry.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(entry => entry.category === filters.category);
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
      
      filtered = filtered.filter(entry => 
        new Date(entry.dateAdded) >= filterDate
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'emailOrDomain':
          aValue = a.emailOrDomain;
          bValue = b.emailOrDomain;
          break;
        case 'dateAdded':
          aValue = new Date(a.dateAdded);
          bValue = new Date(b.dateAdded);
          break;
        case 'lastModified':
          aValue = new Date(a.lastModified || a.dateAdded);
          bValue = new Date(b.lastModified || b.dateAdded);
          break;
        case 'usageCount':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEntries(filtered);
  };

  const validateEmailOrDomain = (value: string, type: 'email' | 'domain'): boolean => {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    } else {
      const domainRegex = /^@?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return domainRegex.test(value.startsWith('@') ? value : `@${value}`);
    }
  };

  const handleAddEntry = async () => {
    try {
      // Validate input
      if (!validateEmailOrDomain(newEntry.emailOrDomain, newEntry.type)) {
        alert(`Invalid ${newEntry.type} format`);
        return;
      }

      // Check for duplicates
      const isDuplicate = entries.some(entry => 
        entry.emailOrDomain.toLowerCase() === newEntry.emailOrDomain.toLowerCase()
      );

      if (isDuplicate) {
        alert('This email/domain is already in the whitelist');
        return;
      }

      const entry: WhitelistEntry = {
        id: `wl-${Date.now()}`,
        emailOrDomain: newEntry.emailOrDomain,
        type: newEntry.type,
        status: 'active',
        dateAdded: new Date().toISOString(),
        addedBy: adminUser?.email || 'admin',
        notes: newEntry.notes,
        category: newEntry.category,
        expiresAt: newEntry.expiresAt || undefined,
        usageCount: 0
      };

      setEntries(prev => [entry, ...prev]);
      setShowAddModal(false);
      setNewEntry({
        emailOrDomain: '',
        type: 'email',
        category: 'investor',
        notes: '',
        expiresAt: ''
      });

      // Add to recent changes for undo
      setRecentChanges(prev => [{
        id: entry.id,
        action: 'add',
        timestamp: new Date(),
        data: entry
      }, ...prev.slice(0, 9)]);

      await logAdminAction('ADD_WHITELIST_ENTRY', `Added ${newEntry.type}: ${newEntry.emailOrDomain}`);
      
    } catch (error) {
      console.error('Failed to add whitelist entry:', error);
    }
  };

  const handleEditEntry = async () => {
    if (!editingEntry) return;

    try {
      const updatedEntry = {
        ...editingEntry,
        status: editForm.status,
        category: editForm.category,
        notes: editForm.notes,
        expiresAt: editForm.expiresAt || undefined,
        lastModified: new Date().toISOString(),
        modifiedBy: adminUser?.email || 'admin'
      };

      setEntries(prev => prev.map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      ));

      // Add to recent changes for undo
      setRecentChanges(prev => [{
        id: editingEntry.id,
        action: 'edit',
        timestamp: new Date(),
        data: { old: editingEntry, new: updatedEntry }
      }, ...prev.slice(0, 9)]);

      setShowEditModal(false);
      setEditingEntry(null);

      await logAdminAction('EDIT_WHITELIST_ENTRY', `Updated ${editingEntry.emailOrDomain}`);
      
    } catch (error) {
      console.error('Failed to edit whitelist entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string, emailOrDomain: string) => {
    if (!confirm(`Are you sure you want to delete ${emailOrDomain} from the whitelist?`)) {
      return;
    }

    try {
      const entryToDelete = entries.find(e => e.id === entryId);
      if (!entryToDelete) return;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      setSelectedEntries(prev => prev.filter(id => id !== entryId));

      // Add to recent changes for undo
      setRecentChanges(prev => [{
        id: entryId,
        action: 'delete',
        timestamp: new Date(),
        data: entryToDelete
      }, ...prev.slice(0, 9)]);

      await logAdminAction('DELETE_WHITELIST_ENTRY', `Deleted ${emailOrDomain}`);
      
    } catch (error) {
      console.error('Failed to delete whitelist entry:', error);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedEntries.length === 0) return;

    const confirmMessage = `Are you sure you want to ${action} ${selectedEntries.length} selected entries?`;
    if (!confirm(confirmMessage)) return;

    try {
      const affectedEntries = entries.filter(entry => selectedEntries.includes(entry.id));

      if (action === 'delete') {
        setEntries(prev => prev.filter(entry => !selectedEntries.includes(entry.id)));
      } else {
        const newStatus = action === 'activate' ? 'active' : 'inactive';
        setEntries(prev => prev.map(entry => 
          selectedEntries.includes(entry.id) 
            ? { 
                ...entry, 
                status: newStatus as WhitelistEntry['status'],
                lastModified: new Date().toISOString(),
                modifiedBy: adminUser?.email || 'admin'
              }
            : entry
        ));
      }

      // Add to recent changes for undo
      setRecentChanges(prev => [{
        id: `bulk-${Date.now()}`,
        action: 'bulk',
        timestamp: new Date(),
        data: { action, entries: affectedEntries }
      }, ...prev.slice(0, 9)]);

      setSelectedEntries([]);
      setShowBulkActions(false);

      await logAdminAction('BULK_WHITELIST_ACTION', `${action} applied to ${selectedEntries.length} entries`);
      
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const text = await uploadFile.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      let success = 0;
      let failed = 0;
      let duplicates = 0;
      const errors: string[] = [];
      const newEntries: WhitelistEntry[] = [];

      for (const line of lines) {
        // Skip header row if it contains common CSV headers
        if (line.toLowerCase().includes('email') || line.toLowerCase().includes('domain')) {
          continue;
        }

        const [emailOrDomain, category = 'investor', notes = ''] = line.split(',').map(s => s.trim());
        
        if (!emailOrDomain) continue;

        // Determine type
        const type = emailOrDomain.includes('@') && !emailOrDomain.startsWith('@') ? 'email' : 'domain';
        
        // Validate format
        if (!validateEmailOrDomain(emailOrDomain, type)) {
          errors.push(`Invalid ${type} format: ${emailOrDomain}`);
          failed++;
          continue;
        }

        // Check for duplicates
        const isDuplicate = entries.some(entry => 
          entry.emailOrDomain.toLowerCase() === emailOrDomain.toLowerCase()
        ) || newEntries.some(entry => 
          entry.emailOrDomain.toLowerCase() === emailOrDomain.toLowerCase()
        );

        if (isDuplicate) {
          duplicates++;
          continue;
        }

        const entry: WhitelistEntry = {
          id: `wl-upload-${Date.now()}-${success}`,
          emailOrDomain,
          type,
          status: 'active',
          dateAdded: new Date().toISOString(),
          addedBy: adminUser?.email || 'admin',
          notes: notes || `Bulk uploaded from ${uploadFile.name}`,
          category: (category as WhitelistEntry['category']) || 'investor',
          usageCount: 0
        };

        newEntries.push(entry);
        success++;
      }

      setEntries(prev => [...newEntries, ...prev]);
      setUploadResult({ success, failed, errors, duplicates });

      await logAdminAction('BULK_UPLOAD_WHITELIST', `Uploaded ${success} entries from ${uploadFile.name}`);
      
    } catch (error) {
      console.error('Failed to upload file:', error);
      setUploadResult({ success: 0, failed: 1, errors: ['Failed to process file'], duplicates: 0 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportWhitelist = async () => {
    try {
      const csvContent = [
        ['Email/Domain', 'Type', 'Status', 'Category', 'Date Added', 'Added By', 'Usage Count', 'Notes'].join(','),
        ...filteredEntries.map(entry => [
          entry.emailOrDomain,
          entry.type,
          entry.status,
          entry.category,
          entry.dateAdded,
          entry.addedBy,
          entry.usageCount || 0,
          `"${entry.notes || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dronera-whitelist-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await logAdminAction('EXPORT_WHITELIST', `Exported ${filteredEntries.length} entries to CSV`);
      
    } catch (error) {
      console.error('Failed to export whitelist:', error);
    }
  };

  const handleUndo = async (changeId: string) => {
    const change = recentChanges.find(c => c.id === changeId);
    if (!change) return;

    try {
      switch (change.action) {
        case 'add':
          setEntries(prev => prev.filter(entry => entry.id !== change.data.id));
          break;
        case 'edit':
          setEntries(prev => prev.map(entry => 
            entry.id === change.data.old.id ? change.data.old : entry
          ));
          break;
        case 'delete':
          setEntries(prev => [change.data, ...prev]);
          break;
        case 'bulk':
          // Restore bulk changes
          if (change.data.action === 'delete') {
            setEntries(prev => [...change.data.entries, ...prev]);
          } else {
            setEntries(prev => prev.map(entry => {
              const originalEntry = change.data.entries.find((e: WhitelistEntry) => e.id === entry.id);
              return originalEntry || entry;
            }));
          }
          break;
      }

      setRecentChanges(prev => prev.filter(c => c.id !== changeId));
      await logAdminAction('UNDO_WHITELIST_CHANGE', `Undid ${change.action} action`);
      
    } catch (error) {
      console.error('Failed to undo change:', error);
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

  const getStatusIcon = (status: WhitelistEntry['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive': return <Ban className="w-4 h-4 text-red-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTypeIcon = (type: WhitelistEntry['type']) => {
    return type === 'email' ? <Mail className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const getCategoryColor = (category: WhitelistEntry['category']) => {
    switch (category) {
      case 'core': return 'text-plasma bg-blue-900';
      case 'investor': return 'text-green-400 bg-green-900';
      case 'partner': return 'text-purple-400 bg-purple-900';
      case 'temporary': return 'text-yellow-400 bg-yellow-900';
    }
  };

  const getStatusColor = (status: WhitelistEntry['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900';
      case 'inactive': return 'text-red-400 bg-red-900';
      case 'pending': return 'text-yellow-400 bg-yellow-900';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt?: string) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Whitelist Control</h1>
          <p className="text-gray-400">Manage email and domain whitelist for platform access</p>
        </div>
        <div className="flex items-center space-x-4">
          <CyberButton onClick={handleExportWhitelist}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </CyberButton>
          <CyberButton onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </CyberButton>
          <CyberButton onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </CyberButton>
          <CyberButton onClick={loadWhitelistEntries} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
        </div>
      </div>

      {/* Recent Changes - Undo Functionality */}
      {recentChanges.length > 0 && (
        <HudPanel className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Recent Changes</span>
            <div className="flex space-x-2">
              {recentChanges.slice(0, 3).map((change) => (
                <CyberButton
                  key={change.id}
                  onClick={() => handleUndo(change.id)}
                  className="text-xs py-1 px-3"
                >
                  <Undo2 className="w-3 h-3 mr-1" />
                  Undo {change.action}
                </CyberButton>
              ))}
            </div>
          </div>
        </HudPanel>
      )}

      {/* Filters and Search */}
      <HudPanel className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search whitelist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="domain">Domain</option>
            </select>
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
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
            >
              <option value="all">All Categories</option>
              <option value="core">Core</option>
              <option value="investor">Investor</option>
              <option value="partner">Partner</option>
              <option value="temporary">Temporary</option>
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
              <option value="dateAdded">Date Added</option>
              <option value="emailOrDomain">Email/Domain</option>
              <option value="lastModified">Last Modified</option>
              <option value="usageCount">Usage Count</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-plasma hover:text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredEntries.length} of {entries.length} entries
          </div>
        </div>
      </HudPanel>

      {/* Bulk Actions */}
      {selectedEntries.length > 0 && (
        <HudPanel className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              {selectedEntries.length} entries selected
            </span>
            <div className="flex space-x-2">
              <CyberButton 
                onClick={() => handleBulkAction('activate')}
                className="text-xs py-1 px-3"
              >
                <Check className="w-3 h-3 mr-1" />
                Activate
              </CyberButton>
              <CyberButton 
                onClick={() => handleBulkAction('deactivate')}
                className="text-xs py-1 px-3"
                variant="red"
              >
                <Ban className="w-3 h-3 mr-1" />
                Deactivate
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
                onClick={() => setSelectedEntries([])}
                className="text-xs py-1 px-3"
              >
                Clear
              </CyberButton>
            </div>
          </div>
        </HudPanel>
      )}

      {/* Whitelist Table */}
      <HudPanel className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plasma mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading whitelist...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No whitelist entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-2">
                    <input
                      type="checkbox"
                      checked={selectedEntries.length === filteredEntries.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntries(filteredEntries.map(e => e.id));
                        } else {
                          setSelectedEntries([]);
                        }
                      }}
                      className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email/Domain</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Usage</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Added</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className={`border-b border-gray-800 hover:bg-[#0d0d14] ${
                    isExpired(entry.expiresAt) ? 'opacity-60' : ''
                  }`}>
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEntries(prev => [...prev, entry.id]);
                          } else {
                            setSelectedEntries(prev => prev.filter(id => id !== entry.id));
                          }
                        }}
                        className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium font-mono">{entry.emailOrDomain}</p>
                        {entry.notes && (
                          <p className="text-sm text-gray-400 truncate max-w-xs">{entry.notes}</p>
                        )}
                        {isExpired(entry.expiresAt) && (
                          <p className="text-xs text-red-400">EXPIRED</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(entry.type)}
                        <span className="capitalize">{entry.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(entry.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {entry.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(entry.category)}`}>
                        {entry.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{entry.usageCount || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm">{formatDate(entry.dateAdded)}</p>
                        <p className="text-xs text-gray-400">by {entry.addedBy}</p>
                        {entry.lastModified && (
                          <p className="text-xs text-gray-500">
                            Modified {formatDate(entry.lastModified)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setEditForm({
                              status: entry.status,
                              category: entry.category,
                              notes: entry.notes || '',
                              expiresAt: entry.expiresAt || ''
                            });
                            setShowEditModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id, entry.emailOrDomain)}
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

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Whitelist Entry</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email or Domain *
                </label>
                <input
                  type="text"
                  value={newEntry.emailOrDomain}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, emailOrDomain: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="user@example.com or @domain.com"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  For domains, use @domain.com format
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value as 'email' | 'domain' }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="email">Email</option>
                  <option value="domain">Domain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, category: e.target.value as WhitelistEntry['category'] }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="core">Core</option>
                  <option value="investor">Investor</option>
                  <option value="partner">Partner</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newEntry.expiresAt}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Optional notes about this entry..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <CyberButton
                onClick={handleAddEntry}
                className="flex-1"
                disabled={!newEntry.emailOrDomain}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </CyberButton>
              <CyberButton
                onClick={() => setShowAddModal(false)}
                variant="red"
                className="px-6"
              >
                Cancel
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Whitelist Entry</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email/Domain
                </label>
                <p className="text-gray-400 bg-[#0d0d14] p-2 rounded font-mono">
                  {editingEntry.emailOrDomain}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as WhitelistEntry['status'] }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value as WhitelistEntry['category'] }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                >
                  <option value="core">Core</option>
                  <option value="investor">Investor</option>
                  <option value="partner">Partner</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={editForm.expiresAt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Add notes about this entry..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <CyberButton
                onClick={handleEditEntry}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </CyberButton>
              <CyberButton
                onClick={() => setShowEditModal(false)}
                variant="red"
                className="px-6"
              >
                Cancel
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bulk Upload Whitelist</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadResult(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!uploadResult ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload CSV/Excel File
                  </label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>

                <div className="bg-[#0d0d14] p-4 rounded-lg">
                  <h3 className="font-bold text-plasma mb-2">File Format Requirements</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>CSV format: <code>email_or_domain,category,notes</code></p>
                    <p><strong>Example:</strong></p>
                    <pre className="bg-[#161620] p-2 rounded text-xs">
user@example.com,investor,High-value investor{'\n'}
@company.com,partner,Partner organization{'\n'}
temp@test.com,temporary,Temporary access
                    </pre>
                    <p className="text-yellow-400">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Duplicates will be automatically skipped
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <CyberButton
                    onClick={handleFileUpload}
                    className="flex-1"
                    disabled={!uploadFile || isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload & Process'}
                  </CyberButton>
                  <CyberButton
                    onClick={() => setShowUploadModal(false)}
                    variant="red"
                    className="px-6"
                  >
                    Cancel
                  </CyberButton>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-plasma">Upload Results</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-900 bg-opacity-30 rounded">
                    <div className="text-2xl font-bold text-green-400">{uploadResult.success}</div>
                    <div className="text-sm text-green-300">Successful</div>
                  </div>
                  <div className="text-center p-4 bg-red-900 bg-opacity-30 rounded">
                    <div className="text-2xl font-bold text-red-400">{uploadResult.failed}</div>
                    <div className="text-sm text-red-300">Failed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-900 bg-opacity-30 rounded">
                    <div className="text-2xl font-bold text-yellow-400">{uploadResult.duplicates}</div>
                    <div className="text-sm text-yellow-300">Duplicates</div>
                  </div>
                  <div className="text-center p-4 bg-blue-900 bg-opacity-30 rounded">
                    <div className="text-2xl font-bold text-blue-400">
                      {uploadResult.success + uploadResult.failed + uploadResult.duplicates}
                    </div>
                    <div className="text-sm text-blue-300">Total</div>
                  </div>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-bold text-red-400 mb-2">Errors:</h4>
                    <div className="bg-red-900 bg-opacity-30 p-4 rounded max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-300">{error}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <CyberButton
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadResult(null);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Done
                  </CyberButton>
                  <CyberButton
                    onClick={() => {
                      setUploadFile(null);
                      setUploadResult(null);
                    }}
                    className="px-6"
                  >
                    Upload Another
                  </CyberButton>
                </div>
              </div>
            )}
          </HudPanel>
        </div>
      )}
    </div>
  );
};

export default AdminWhitelistPage;