import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Users, 
  BarChart, 
  FileText,
  Menu,
  Plus,
  RefreshCw,
  X,
  Download
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CreateProposal from '../components/CreateProposal';
import { Proposal } from '../types/governance';

const GovernancePage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'passed' | 'rejected' | 'pending'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'treasury' | 'technical' | 'governance' | 'community'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'votes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showArchivedProposals, setShowArchivedProposals] = useState(false);
  const [archivedProposals, setArchivedProposals] = useState<Proposal[]>([]);

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

  // Load proposals and user votes on component mount
  useEffect(() => {
    loadProposals();
    if (user) {
      loadUserVotes();
    }
  }, [user]);

  // Filter proposals when data changes
  useEffect(() => {
    applyFilters();
  }, [proposals, searchTerm, filterStatus, filterCategory, sortBy, sortOrder]);

  // Load proposals from database
  const loadProposals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch active proposals
      const { data: activeData, error: activeError } = await supabase
        .from('governance_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Map database results to our Proposal interface
      const mappedProposals: Proposal[] = (activeData || []).map(item => ({
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
      
      // Fetch archived proposals if needed
      if (showArchivedProposals) {
        const { data: archivedData, error: archivedError } = await supabase
          .from('governance_proposals_archive')
          .select('*')
          .order('archived_at', { ascending: false });
          
        if (archivedError) throw archivedError;
        
        const mappedArchivedProposals: Proposal[] = (archivedData || []).map(item => ({
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
          expectedImpact: item.expected_impact,
          archived: true,
          archivedAt: item.archived_at
        }));
        
        setArchivedProposals(mappedArchivedProposals);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load proposals:', error);
      setError('Failed to load proposals. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load user votes
  const loadUserVotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('governance_votes')
        .select('proposal_id, vote_type')
        .eq('voter_address', user.id);

      if (error) throw error;

      const votes: Record<string, string> = {};
      data?.forEach(vote => {
        votes[vote.proposal_id] = vote.vote_type;
      });

      setUserVotes(votes);
    } catch (error) {
      console.error('Failed to load user votes:', error);
    }
  };

  // Apply filters to proposals
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
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else { // votes
        const votesA = a.votesFor + a.votesAgainst + a.votesAbstain;
        const votesB = b.votesFor + b.votesAgainst + b.votesAbstain;
        return sortOrder === 'asc' ? votesA - votesB : votesB - votesA;
      }
    });
    
    setFilteredProposals(filtered);
  };

  // Handle voting on a proposal
  const handleVote = async (proposalId: string, voteType: 'for' | 'against' | 'abstain') => {
    if (!user) {
      setVoteError('You must be logged in to vote');
      return;
    }
    
    if (userVotes[proposalId]) {
      setVoteError('You have already voted on this proposal');
      return;
    }
    
    setIsVoting(true);
    setVoteError(null);
    
    try {
      // Get user's token balance for vote weight
      const { data: tokenData, error: tokenError } = await supabase
        .from('token_holders')
        .select('balance')
        .eq('user_id', user.id)
        .single();
        
      if (tokenError && tokenError.code !== 'PGRST116') {
        throw tokenError;
      }
      
      const voteWeight = tokenData?.balance || 1; // Default to 1 if no tokens
      
      // Cast vote via Edge Function
      const response = await supabase.functions.invoke('governance-api', {
        body: {
          proposalId,
          voterAddress: user.id,
          voteType,
          voteWeight
        },
        method: 'POST',
        path: 'vote'
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to cast vote');
      }
      
      // Update local state
      setUserVotes({
        ...userVotes,
        [proposalId]: voteType
      });
      
      // Refresh proposals to get updated vote counts
      loadProposals();
      
    } catch (error: any) {
      console.error('Failed to cast vote:', error);
      setVoteError(error.message || 'Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  // Refresh proposals
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProposals();
  };

  // View proposal details
  const viewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowProposalModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate progress percentage
  const calculateProgress = (votesFor: number, votesAgainst: number, votesAbstain: number, quorum: number) => {
    const total = votesFor + votesAgainst + votesAbstain;
    return Math.min((total / quorum) * 100, 100);
  };

  // Calculate vote percentages
  const calculateVotePercentages = (votesFor: number, votesAgainst: number, votesAbstain: number) => {
    const total = votesFor + votesAgainst + votesAbstain;
    if (total === 0) return { for: 0, against: 0, abstain: 0 };
    
    return {
      for: (votesFor / total) * 100,
      against: (votesAgainst / total) * 100,
      abstain: (votesAbstain / total) * 100
    };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-900 text-blue-300';
      case 'passed': return 'bg-green-900 text-green-300';
      case 'rejected': return 'bg-red-900 text-red-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Calendar className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'treasury': return <BarChart className="w-4 h-4 text-plasma" />;
      case 'technical': return <FileText className="w-4 h-4 text-plasma" />;
      case 'governance': return <Vote className="w-4 h-4 text-plasma" />;
      case 'community': return <Users className="w-4 h-4 text-plasma" />;
      default: return null;
    }
  };

  // Check if proposal is active and user can vote
  const canVote = (proposal: Proposal) => {
    if (!user) return false;
    if (proposal.status !== 'active') return false;
    if (userVotes[proposal.id]) return false;
    
    const now = new Date();
    const startDate = new Date(proposal.startDate);
    const endDate = new Date(proposal.endDate);
    
    return now >= startDate && now <= endDate;
  };

  // Handle proposal creation
  const handleProposalCreated = () => {
    loadProposals();
  };

  // Export proposals to CSV
  const handleExportProposals = () => {
    const proposals = showArchivedProposals ? [...filteredProposals, ...archivedProposals] : filteredProposals;
    const csvContent = [
      ['ID', 'Title', 'Category', 'Status', 'Start Date', 'End Date', 'Votes For', 'Votes Against', 'Votes Abstain', 'Quorum', 'Created By', 'Created At'].join(','),
      ...proposals.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.category,
        p.status,
        formatDate(p.startDate),
        formatDate(p.endDate),
        p.votesFor,
        p.votesAgainst,
        p.votesAbstain,
        p.quorum,
        p.createdBy,
        formatDate(p.createdAt)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `governance-proposals-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <Vote className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Governance</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Governance</h1>
                <p className="text-gray-400">Participate in DRONERA's decentralized governance</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400 hidden md:block">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <CyberButton onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </CyberButton>
                <CyberButton onClick={() => setShowCreateProposalModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Proposal
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

            {/* Governance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Vote className="w-8 h-8 text-plasma mb-3" />
                  <h3 className="mono text-gray-400 text-sm uppercase tracking-wider mb-1">Active Proposals</h3>
                  <p className="text-2xl font-bold text-plasma">
                    {proposals.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="mono text-gray-400 text-sm uppercase tracking-wider mb-1">Passed Proposals</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {proposals.filter(p => p.status === 'passed').length}
                  </p>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="w-8 h-8 text-plasma mb-3" />
                  <h3 className="mono text-gray-400 text-sm uppercase tracking-wider mb-1">Your Votes</h3>
                  <p className="text-2xl font-bold text-plasma">
                    {Object.keys(userVotes).length}
                  </p>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Calendar className="w-8 h-8 text-plasma mb-3" />
                  <h3 className="mono text-gray-400 text-sm uppercase tracking-wider mb-1">Upcoming End</h3>
                  {(() => {
                    const activeProposals = proposals.filter(p => p.status === 'active');
                    if (activeProposals.length === 0) {
                      return <p className="text-2xl font-bold text-plasma">-</p>;
                    }
                    
                    const nextEndingProposal = activeProposals.reduce((prev, current) => {
                      return new Date(prev.endDate) < new Date(current.endDate) ? prev : current;
                    });
                    
                    return <p className="text-2xl font-bold text-plasma">{formatDate(nextEndingProposal.endDate)}</p>;
                  })()}
                </div>
              </HudPanel>
            </div>

            {/* Filters */}
            <HudPanel className="p-6 mb-8">
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
                
                <div className="flex items-end justify-between">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-400">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#0d0d14] border border-gray-700 text-white px-3 py-1 rounded text-sm focus:ring-plasma focus:border-plasma"
                    >
                      <option value="date">Date</option>
                      <option value="votes">Votes</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-1 bg-[#0d0d14] rounded border border-gray-700"
                    >
                      {sortOrder === 'asc' ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-400 mr-2">
                      <input
                        type="checkbox"
                        checked={showArchivedProposals}
                        onChange={() => setShowArchivedProposals(!showArchivedProposals)}
                        className="mr-2"
                      />
                      Show Archived
                    </label>
                    
                    <CyberButton 
                      onClick={handleExportProposals}
                      className="text-xs py-1 px-3"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </CyberButton>
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
              ) : filteredProposals.length === 0 && (!showArchivedProposals || archivedProposals.length === 0) ? (
                <div className="text-center py-8">
                  <Vote className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No proposals found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                      ? 'Try adjusting your search filters' 
                      : 'Be the first to create a governance proposal'
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
                    <CyberButton onClick={() => setShowCreateProposalModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Proposal
                    </CyberButton>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Proposals */}
                  {filteredProposals.length > 0 && (
                    <div className="space-y-4">
                      {filteredProposals.map((proposal) => (
                        <div key={proposal.id} className="bg-[#0d0d14] rounded-lg p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center mb-2">
                                <div className={`px-2 py-1 rounded text-xs inline-flex items-center space-x-1 ${getStatusColor(proposal.status)}`}>
                                  {getStatusIcon(proposal.status)}
                                  <span className="capitalize ml-1">{proposal.status}</span>
                                </div>
                                <div className="ml-2 flex items-center text-xs text-gray-400">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  <span>Ends: {formatDate(proposal.endDate)}</span>
                                </div>
                                <div className="ml-2 flex items-center text-xs">
                                  {getCategoryIcon(proposal.category)}
                                  <span className="capitalize ml-1 text-gray-400">{proposal.category}</span>
                                </div>
                              </div>
                              <h3 className="text-xl font-bold">{proposal.title}</h3>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                              {canVote(proposal) && (
                                <div className="flex space-x-2">
                                  <CyberButton 
                                    onClick={() => handleVote(proposal.id, 'for')}
                                    className="text-xs py-1 px-3"
                                    disabled={isVoting}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    For
                                  </CyberButton>
                                  <CyberButton 
                                    onClick={() => handleVote(proposal.id, 'against')}
                                    className="text-xs py-1 px-3"
                                    disabled={isVoting}
                                    variant="red"
                                  >
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Against
                                  </CyberButton>
                                  <CyberButton 
                                    onClick={() => handleVote(proposal.id, 'abstain')}
                                    className="text-xs py-1 px-3"
                                    disabled={isVoting}
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    Abstain
                                  </CyberButton>
                                </div>
                              )}
                              
                              {userVotes[proposal.id] && (
                                <div className="px-3 py-1 bg-[#161620] rounded text-xs">
                                  You voted: <span className="font-bold capitalize">{userVotes[proposal.id]}</span>
                                </div>
                              )}
                              
                              <CyberButton 
                                onClick={() => viewProposal(proposal)}
                                className="text-xs py-1 px-3"
                              >
                                View Details
                              </CyberButton>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-gray-300 line-clamp-2">{proposal.description}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Quorum Progress</span>
                                <span>
                                  {((proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain) / proposal.quorum * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-[#161620] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-plasma"
                                  style={{ width: `${calculateProgress(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain, proposal.quorum)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>For</span>
                                  <span className="text-green-400">{proposal.votesFor.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-400"
                                    style={{ width: `${calculateVotePercentages(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain).for}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Against</span>
                                  <span className="text-red-400">{proposal.votesAgainst.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-400"
                                    style={{ width: `${calculateVotePercentages(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain).against}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Abstain</span>
                                  <span className="text-gray-400">{proposal.votesAbstain.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gray-400"
                                    style={{ width: `${calculateVotePercentages(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain).abstain}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Archived Proposals */}
                  {showArchivedProposals && archivedProposals.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 border-t border-gray-800 pt-6">Archived Proposals</h3>
                      <div className="space-y-4">
                        {archivedProposals.map((proposal) => (
                          <div key={proposal.id} className="bg-[#0d0d14] rounded-lg p-6 opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div className="mb-4 md:mb-0">
                                <div className="flex items-center mb-2">
                                  <div className={`px-2 py-1 rounded text-xs inline-flex items-center space-x-1 ${getStatusColor(proposal.status)}`}>
                                    {getStatusIcon(proposal.status)}
                                    <span className="capitalize ml-1">{proposal.status}</span>
                                  </div>
                                  <div className="ml-2 flex items-center text-xs text-gray-400">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>Ended: {formatDate(proposal.endDate)}</span>
                                  </div>
                                  <div className="ml-2 flex items-center text-xs">
                                    {getCategoryIcon(proposal.category)}
                                    <span className="capitalize ml-1 text-gray-400">{proposal.category}</span>
                                  </div>
                                </div>
                                <h3 className="text-xl font-bold">{proposal.title}</h3>
                              </div>
                              
                              <div>
                                <CyberButton 
                                  onClick={() => viewProposal(proposal)}
                                  className="text-xs py-1 px-3"
                                >
                                  View Details
                                </CyberButton>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-gray-300 line-clamp-2">{proposal.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>For</span>
                                  <span className="text-green-400">{proposal.votesFor.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-400"
                                    style={{ width: `${calculateVotePercentages(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain).for}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Against</span>
                                  <span className="text-red-400">{proposal.votesAgainst.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-400"
                                    style={{ width: `${calculateVotePercentages(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain).against}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Abstain</span>
                                  <span className="text-gray-400">{proposal.votesAbstain.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gray-400"
                                    style={{ width: `${calculateVotePercentages(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain).abstain}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            {proposal.archivedAt && (
                              <div className="mt-3 text-xs text-gray-500">
                                Archived: {formatDate(proposal.archivedAt)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Vote Error */}
              {voteError && (
                <div className="mt-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                      <p className="text-sm text-red-300">{voteError}</p>
                    </div>
                    <button
                      onClick={() => setVoteError(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </HudPanel>
          </div>
        </div>
      </div>

      {/* Proposal Details Modal */}
      {selectedProposal && showProposalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{selectedProposal.title}</h2>
                <div className={`ml-4 px-2 py-1 rounded text-xs inline-flex items-center ${getStatusColor(selectedProposal.status)}`}>
                  {getStatusIcon(selectedProposal.status)}
                  <span className="capitalize ml-1">{selectedProposal.status}</span>
                </div>
              </div>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Proposal Details */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Description</h3>
                    <p className="text-gray-300 whitespace-pre-line">{selectedProposal.description}</p>
                  </div>
                  
                  {selectedProposal.proposedChanges && (
                    <div>
                      <h3 className="text-lg font-bold mb-2">Proposed Changes</h3>
                      <p className="text-gray-300 whitespace-pre-line">{selectedProposal.proposedChanges}</p>
                    </div>
                  )}
                  
                  {selectedProposal.implementationTimeline && (
                    <div>
                      <h3 className="text-lg font-bold mb-2">Implementation Timeline</h3>
                      <p className="text-gray-300 whitespace-pre-line">{selectedProposal.implementationTimeline}</p>
                    </div>
                  )}
                  
                  {selectedProposal.expectedImpact && (
                    <div>
                      <h3 className="text-lg font-bold mb-2">Expected Impact</h3>
                      <p className="text-gray-300 whitespace-pre-line">{selectedProposal.expectedImpact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Voting Information */}
              <div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Voting Information</h3>
                    <div className="bg-[#0d0d14] p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Start Date</span>
                        <span>{formatDate(selectedProposal.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">End Date</span>
                        <span>{formatDate(selectedProposal.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category</span>
                        <span className="capitalize">{selectedProposal.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created By</span>
                        <span className="truncate max-w-[150px]">{selectedProposal.createdBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created On</span>
                        <span>{formatDate(selectedProposal.createdAt)}</span>
                      </div>
                      {selectedProposal.archived && selectedProposal.archivedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Archived On</span>
                          <span>{formatDate(selectedProposal.archivedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Voting Results</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Quorum Progress</span>
                          <span>
                            {((selectedProposal.votesFor + selectedProposal.votesAgainst + selectedProposal.votesAbstain) / selectedProposal.quorum * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#161620] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-plasma"
                            style={{ width: `${calculateProgress(selectedProposal.votesFor, selectedProposal.votesAgainst, selectedProposal.votesAbstain, selectedProposal.quorum)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>For</span>
                          <span className="text-green-400">{selectedProposal.votesFor.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-[#161620] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-400"
                            style={{ width: `${calculateVotePercentages(selectedProposal.votesFor, selectedProposal.votesAgainst, selectedProposal.votesAbstain).for}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Against</span>
                          <span className="text-red-400">{selectedProposal.votesAgainst.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-[#161620] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-400"
                            style={{ width: `${calculateVotePercentages(selectedProposal.votesFor, selectedProposal.votesAgainst, selectedProposal.votesAbstain).against}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Abstain</span>
                          <span className="text-gray-400">{selectedProposal.votesAbstain.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-[#161620] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-400"
                            style={{ width: `${calculateVotePercentages(selectedProposal.votesFor, selectedProposal.votesAgainst, selectedProposal.votesAbstain).abstain}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {canVote(selectedProposal) && (
                    <div>
                      <h3 className="text-lg font-bold mb-4">Cast Your Vote</h3>
                      <div className="flex flex-col space-y-2">
                        <CyberButton 
                          onClick={() => handleVote(selectedProposal.id, 'for')}
                          disabled={isVoting}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Vote For
                        </CyberButton>
                        <CyberButton 
                          onClick={() => handleVote(selectedProposal.id, 'against')}
                          disabled={isVoting}
                          variant="red"
                          className="w-full"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Vote Against
                        </CyberButton>
                        <CyberButton 
                          onClick={() => handleVote(selectedProposal.id, 'abstain')}
                          disabled={isVoting}
                          className="w-full"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Abstain
                        </CyberButton>
                      </div>
                    </div>
                  )}
                  
                  {userVotes[selectedProposal.id] && (
                    <div className="bg-[#161620] p-4 rounded-lg">
                      <h3 className="font-bold mb-2">Your Vote</h3>
                      <p className="text-plasma capitalize">
                        You voted: {userVotes[selectedProposal.id]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
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

export default GovernancePage;