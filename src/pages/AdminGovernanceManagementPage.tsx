import React, { useState, useEffect, useRef } from 'react';
import { 
  Vote, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Calendar,
  BarChart,
  Users,
  FileText,
  RefreshCw,
  Save,
  X,
  Info
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';
import CreateProposal from '../components/CreateProposal';
import { Proposal } from '../types/governance';

const AdminGovernanceManagementPage: React.FC = () => {
  const { adminUser, logAdminAction } = useAdminAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'passed' | 'rejected' | 'pending'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'treasury' | 'technical' | 'governance' | 'community'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
  
  // Form state for new/edit proposal
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    quorum: 1000000,
    category: 'treasury' as 'treasury' | 'technical' | 'governance' | 'community',
    status: 'pending' as 'active' | 'pending' | 'passed' | 'rejected',
    proposedChanges: '',
    implementationTimeline: '',
    expectedImpact: ''
  });

  // Set up real-time subscription for proposals
  useEffect(() => {
    const proposalsSubscription = supabase
      .channel('governance_proposals_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'governance_proposals' 
        }, 
        (payload) => {
          // Refresh proposals when changes occur
          loadProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(proposalsSubscription);
    };
  }, []);

  useEffect(() => {
    loadProposals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [proposals, searchTerm, filterStatus, filterCategory]);

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      // Fetch proposals from Supabase
      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database results to our Proposal interface
      const mappedProposals: Proposal[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        startDate: item.start_date,
        endDate: item.end_date,
        votesFor: item.votes_for,
        votesAgainst: item.votes_against,
        votesAbstain: item.votes_abstain,
        quorum: item.quorum,
        category: item.category,
        createdBy: item.created_by,
        createdAt: item.created_at,
        proposedChanges: item.proposed_changes,
        implementationTimeline: item.implementation_timeline,
        expectedImpact: item.expected_impact
      }));

      setProposals(mappedProposals);
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('VIEW_PROPOSALS', `Viewed ${mappedProposals.length} governance proposals`);
      }
      
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...proposals];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(proposal => 
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === filterStatus);
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(proposal => proposal.category === filterCategory);
    }
    
    setFilteredProposals(filtered);
  };

  const handleCreateProposal = () => {
    setShowCreateProposalModal(true);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setIsEditing(true);
    setEditForm({
      title: proposal.title,
      description: proposal.description,
      startDate: new Date(proposal.startDate).toISOString().slice(0, 16),
      endDate: new Date(proposal.endDate).toISOString().slice(0, 16),
      quorum: proposal.quorum,
      category: proposal.category,
      status: proposal.status,
      proposedChanges: proposal.proposedChanges || '',
      implementationTimeline: proposal.implementationTimeline || '',
      expectedImpact: proposal.expectedImpact || ''
    });
    setSelectedProposal(proposal);
    setShowProposalModal(true);
  };

  const handleDeleteProposal = async () => {
    if (!selectedProposal) return;
    
    try {
      setIsSaving(true);
      
      // Delete from Supabase using the UUID
      const { error } = await supabase
        .from('governance_proposals')
        .delete()
        .eq('id', selectedProposal.id);
        
      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Failed to delete proposal: ${error.message}`);
      }
      
      // Update local state
      setProposals(prevProposals => prevProposals.filter(p => p.id !== selectedProposal.id));
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('DELETE_PROPOSAL', `Deleted proposal: ${selectedProposal.title}`);
      }
      
      setShowDeleteModal(false);
      setSelectedProposal(null);
      
    } catch (error: any) {
      console.error('Failed to delete proposal:', error);
      setSaveError(error.message || 'Failed to delete proposal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Validate form
      if (!editForm.title.trim() || !editForm.description.trim() || !editForm.startDate || !editForm.endDate) {
        throw new Error('Please fill in all required fields');
      }
      
      const startDate = new Date(editForm.startDate);
      const endDate = new Date(editForm.endDate);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      
      if (isEditing && selectedProposal) {
        // Update existing proposal in Supabase
        const { error } = await supabase
          .from('governance_proposals')
          .update({
            title: editForm.title,
            description: editForm.description,
            start_date: new Date(editForm.startDate).toISOString(),
            end_date: new Date(editForm.endDate).toISOString(),
            quorum: editForm.quorum,
            category: editForm.category,
            status: editForm.status,
            proposed_changes: editForm.proposedChanges,
            implementation_timeline: editForm.implementationTimeline,
            expected_impact: editForm.expectedImpact
          })
          .eq('id', selectedProposal.id);
          
        if (error) throw error;
        
        // Update local state
        const updatedProposal: Proposal = {
          ...selectedProposal,
          title: editForm.title,
          description: editForm.description,
          startDate: new Date(editForm.startDate).toISOString(),
          endDate: new Date(editForm.endDate).toISOString(),
          quorum: editForm.quorum,
          category: editForm.category,
          status: editForm.status,
          proposedChanges: editForm.proposedChanges,
          implementationTimeline: editForm.implementationTimeline,
          expectedImpact: editForm.expectedImpact
        };
        
        setProposals(prevProposals => 
          prevProposals.map(p => p.id === selectedProposal.id ? updatedProposal : p)
        );
        
        // Log admin action using the context method
        if (logAdminAction) {
          await logAdminAction('UPDATE_PROPOSAL', `Updated proposal: ${editForm.title}`);
        }
      } else {
        // Create new proposal in Supabase
        const { data, error } = await supabase
          .from('governance_proposals')
          .insert({
            title: editForm.title,
            description: editForm.description,
            status: editForm.status,
            start_date: new Date(editForm.startDate).toISOString(),
            end_date: new Date(editForm.endDate).toISOString(),
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            quorum: editForm.quorum,
            category: editForm.category,
            created_by: adminUser?.email || 'admin@dronera.eu',
            proposed_changes: editForm.proposedChanges,
            implementation_timeline: editForm.implementationTimeline,
            expected_impact: editForm.expectedImpact
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state with the returned data
        const newProposal: Proposal = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          votesFor: data.votes_for,
          votesAgainst: data.votes_against,
          votesAbstain: data.votes_abstain,
          quorum: data.quorum,
          category: data.category,
          createdBy: data.created_by,
          createdAt: data.created_at,
          proposedChanges: data.proposed_changes,
          implementationTimeline: data.implementation_timeline,
          expectedImpact: data.expected_impact
        };
        
        setProposals(prevProposals => [newProposal, ...prevProposals]);
        
        // Log admin action using the context method
        if (logAdminAction) {
          await logAdminAction('CREATE_PROPOSAL', `Created new proposal: ${editForm.title}`);
        }
      }
      
      setSaveSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        setShowProposalModal(false);
        setSaveSuccess(false);
      }, 1500);
      
    } catch (error: any) {
      console.error('Failed to save proposal:', error);
      setSaveError(error.message || 'Failed to save proposal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-900 text-blue-300';
      case 'passed': return 'bg-green-900 text-green-300';
      case 'rejected': return 'bg-red-900 text-red-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Calendar className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'treasury': return <BarChart className="w-4 h-4 text-plasma" />;
      case 'technical': return <FileText className="w-4 h-4 text-plasma" />;
      case 'governance': return <Vote className="w-4 h-4 text-plasma" />;
      case 'community': return <Users className="w-4 h-4 text-plasma" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (votesFor: number, votesAgainst: number, votesAbstain: number) => {
    const total = votesFor + votesAgainst + votesAbstain;
    return {
      for: total > 0 ? (votesFor / total) * 100 : 0,
      against: total > 0 ? (votesAgainst / total) * 100 : 0,
      abstain: total > 0 ? (votesAbstain / total) * 100 : 0
    };
  };

  const calculateQuorumProgress = (votesFor: number, votesAgainst: number, votesAbstain: number, quorum: number) => {
    const total = votesFor + votesAgainst + votesAbstain;
    return (total / quorum) * 100;
  };

  const handleProposalCreated = () => {
    // Refresh the proposals list
    loadProposals();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Governance Management</h1>
          <p className="text-gray-400">Create and manage governance proposals for token holders</p>
        </div>
        <div className="flex items-center space-x-4">
          <CyberButton onClick={loadProposals} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
          <CyberButton onClick={handleCreateProposal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Proposal
          </CyberButton>
        </div>
      </div>

      {/* Filters and Search */}
      <HudPanel className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="passed">Passed</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              >
                <option value="all">All Categories</option>
                <option value="treasury">Treasury</option>
                <option value="technical">Technical</option>
                <option value="governance">Governance</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end items-end">
            <div className="text-sm text-gray-400">
              Showing {filteredProposals.length} of {proposals.length} proposals
            </div>
          </div>
        </div>
      </HudPanel>

      {/* Proposals List */}
      <HudPanel className="p-6">
        <h2 className="text-xl font-bold mb-6">Proposals</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plasma mx-auto mb-4"></div>
            <p className="text-gray-400">Loading proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-8">
            <Vote className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No proposals found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your search filters' 
                : 'Create your first governance proposal'
              }
            </p>
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' ? (
              <CyberButton onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCategory('all');
              }}>
                Clear Filters
              </CyberButton>
            ) : (
              <CyberButton onClick={handleCreateProposal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Proposal
              </CyberButton>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Start Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">End Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Participation</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                    <td className="py-3 px-4">
                      <div className="font-medium">{proposal.title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(proposal.category)}
                        <span className="capitalize">{proposal.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`px-2 py-1 rounded text-xs inline-flex items-center space-x-1 ${getStatusColor(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        <span className="capitalize">{proposal.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatDate(proposal.startDate)}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatDate(proposal.endDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-32">
                        <div className="text-xs mb-1">
                          {((proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain) / proposal.quorum * 100).toFixed(1)}% of quorum
                        </div>
                        <div className="w-full h-1.5 bg-[#0d0d14] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-plasma" 
                            style={{ width: `${calculateQuorumProgress(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain, proposal.quorum)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProposal(proposal)}
                          className="p-1 text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Delete"
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

      {/* Governance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HudPanel className="p-6">
          <h3 className="text-lg font-bold mb-4">Proposal Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Proposals</span>
              <span className="text-plasma font-bold">{proposals.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Proposals</span>
              <span className="text-blue-400 font-bold">{proposals.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Passed Proposals</span>
              <span className="text-green-400 font-bold">{proposals.filter(p => p.status === 'passed').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rejected Proposals</span>
              <span className="text-red-400 font-bold">{proposals.filter(p => p.status === 'rejected').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Proposals</span>
              <span className="text-yellow-400 font-bold">{proposals.filter(p => p.status === 'pending').length}</span>
            </div>
          </div>
        </HudPanel>

        <HudPanel className="p-6">
          <h3 className="text-lg font-bold mb-4">Participation Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Average Participation</span>
              <span className="font-bold text-plasma">
                {proposals.length > 0 
                  ? (proposals.reduce((sum, p) => sum + ((p.votesFor + p.votesAgainst + p.votesAbstain) / p.quorum), 0) / proposals.length * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Highest Participation</span>
              <span className="font-bold text-green-400">
                {proposals.length > 0 
                  ? Math.max(...proposals.map(p => (p.votesFor + p.votesAgainst + p.votesAbstain) / p.quorum * 100)).toFixed(1)
                  : 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Lowest Participation</span>
              <span className="font-bold text-yellow-400">
                {proposals.length > 0 
                  ? Math.min(...proposals.map(p => (p.votesFor + p.votesAgainst + p.votesAbstain) / p.quorum * 100)).toFixed(1)
                  : 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Total Votes Cast</span>
              <span className="font-bold text-plasma">
                {proposals.reduce((sum, p) => sum + p.votesFor + p.votesAgainst + p.votesAbstain, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </HudPanel>

        <HudPanel className="p-6">
          <h3 className="text-lg font-bold mb-4">Category Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart className="w-4 h-4 text-plasma" />
                <span>Treasury</span>
              </div>
              <span className="font-bold">{proposals.filter(p => p.category === 'treasury').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-plasma" />
                <span>Technical</span>
              </div>
              <span className="font-bold">{proposals.filter(p => p.category === 'technical').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Vote className="w-4 h-4 text-plasma" />
                <span>Governance</span>
              </div>
              <span className="font-bold">{proposals.filter(p => p.category === 'governance').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-plasma" />
                <span>Community</span>
              </div>
              <span className="font-bold">{proposals.filter(p => p.category === 'community').length}</span>
            </div>
          </div>
        </HudPanel>
      </div>

      {/* Create/Edit Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{isEditing ? 'Edit Proposal' : 'Create New Proposal'}</h2>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="mb-6 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-300">Proposal saved successfully</p>
                </div>
              </div>
            )}
            
            {saveError && (
              <div className="mb-6 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{saveError}</p>
                  </div>
                  <button
                    onClick={() => setSaveError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveProposal}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Proposal Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Enter a clear, concise title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={6}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Provide a detailed description of the proposal"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      required
                    >
                      <option value="treasury">Treasury</option>
                      <option value="technical">Technical</option>
                      <option value="governance">Governance</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      id="status"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="passed">Passed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="quorum" className="block text-sm font-medium text-gray-300 mb-2">
                      Quorum Required *
                    </label>
                    <input
                      type="number"
                      id="quorum"
                      value={editForm.quorum}
                      onChange={(e) => setEditForm({ ...editForm, quorum: parseInt(e.target.value) })}
                      min="1"
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum number of votes required for validity</p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="proposedChanges" className="block text-sm font-medium text-gray-300 mb-2">
                    Proposed Changes
                  </label>
                  <textarea
                    id="proposedChanges"
                    value={editForm.proposedChanges}
                    onChange={(e) => setEditForm({ ...editForm, proposedChanges: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Describe specific changes being proposed"
                  />
                </div>
                
                <div>
                  <label htmlFor="implementationTimeline" className="block text-sm font-medium text-gray-300 mb-2">
                    Implementation Timeline
                  </label>
                  <textarea
                    id="implementationTimeline"
                    value={editForm.implementationTimeline}
                    onChange={(e) => setEditForm({ ...editForm, implementationTimeline: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Outline the timeline for implementing this proposal if passed"
                  />
                </div>
                
                <div>
                  <label htmlFor="expectedImpact" className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Impact
                  </label>
                  <textarea
                    id="expectedImpact"
                    value={editForm.expectedImpact}
                    onChange={(e) => setEditForm({ ...editForm, expectedImpact: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Describe the expected impact of this proposal on the project"
                  />
                </div>
                
                <div className="bg-[#0d0d14] p-4 rounded-lg flex items-start">
                  <Info className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Important Information</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Proposals cannot be deleted once voting has started</li>
                      <li>Ensure all information is accurate before publishing</li>
                      <li>Token holders will be notified when a new proposal is active</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-800">
                <CyberButton
                  type="button"
                  variant="red"
                  onClick={() => setShowProposalModal(false)}
                >
                  Cancel
                </CyberButton>
                <CyberButton
                  type="submit"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : isEditing ? 'Update Proposal' : 'Create Proposal'}
                </CyberButton>
              </div>
            </form>
          </HudPanel>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-md w-full p-6">
            <div className="text-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Delete Proposal?</h2>
              <p className="text-gray-300">
                Are you sure you want to delete the proposal "{selectedProposal.title}"? This action cannot be undone.
              </p>
            </div>
            
            {saveError && (
              <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-300">{saveError}</p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              <CyberButton
                variant="red"
                className="flex-1"
                onClick={handleDeleteProposal}
                disabled={isSaving}
              >
                {isSaving ? 'Deleting...' : 'Delete Proposal'}
              </CyberButton>
              <CyberButton
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSaveError(null);
                }}
              >
                Cancel
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Create Proposal Modal */}
      <CreateProposal 
        isOpen={showCreateProposalModal}
        onClose={() => setShowCreateProposalModal(false)}
        onProposalCreated={handleProposalCreated}
      />
    </div>
  );
};

export default AdminGovernanceManagementPage;