export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  startDate: string;
  endDate: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  category: 'treasury' | 'technical' | 'governance' | 'community';
  createdBy: string;
  createdAt: string;
  proposedChanges?: string;
  implementationTimeline?: string;
  expectedImpact?: string;
}

export interface ProposalFormData {
  title: string;
  description: string;
  category: 'treasury' | 'technical' | 'governance' | 'community';
  status: 'active' | 'pending' | 'passed' | 'rejected';
  startDate: string;
  endDate: string;
  quorum: number;
  proposedChanges: string;
  implementationTimeline: string;
  expectedImpact: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterAddress: string;
  voteType: 'for' | 'against' | 'abstain';
  voteWeight: number;
  transactionHash?: string;
  createdAt: string;
}