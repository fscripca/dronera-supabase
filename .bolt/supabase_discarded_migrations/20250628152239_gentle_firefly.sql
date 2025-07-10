/*
  # Create Governance Management Tables

  1. New Tables
    - `governance_proposals` - Stores proposal information
    - `governance_votes` - Tracks votes on proposals
    - `governance_policies` - Stores governance policy documents
    - `governance_compliance` - Tracks compliance records

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add policies for user access where appropriate

  3. Functions
    - Function to get governance metrics
    - Function to cast votes
    - Function to calculate proposal results
*/

-- Create governance_proposals table
CREATE TABLE IF NOT EXISTS governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'passed', 'rejected', 'pending')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  votes_for integer NOT NULL DEFAULT 0,
  votes_against integer NOT NULL DEFAULT 0,
  votes_abstain integer NOT NULL DEFAULT 0,
  quorum integer NOT NULL,
  category text NOT NULL CHECK (category IN ('treasury', 'technical', 'governance', 'community')),
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create governance_votes table
CREATE TABLE IF NOT EXISTS governance_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
  voter_address text NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
  vote_weight integer NOT NULL,
  transaction_hash text,
  created_at timestamptz DEFAULT now()
);

-- Create governance_policies table
CREATE TABLE IF NOT EXISTS governance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  version text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'draft', 'archived')),
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  updated_by text
);

-- Create governance_compliance table
CREATE TABLE IF NOT EXISTS governance_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('compliant', 'non-compliant', 'pending')),
  details text NOT NULL,
  performed_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_compliance ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_governance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_governance_proposals_updated_at
  BEFORE UPDATE ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_governance_updated_at();

CREATE TRIGGER update_governance_policies_updated_at
  BEFORE UPDATE ON governance_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_governance_updated_at();

CREATE TRIGGER update_governance_compliance_updated_at
  BEFORE UPDATE ON governance_compliance
  FOR EACH ROW
  EXECUTE FUNCTION update_governance_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_category ON governance_proposals(category);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_created_at ON governance_proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_start_date ON governance_proposals(start_date);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_end_date ON governance_proposals(end_date);

CREATE INDEX IF NOT EXISTS idx_governance_votes_proposal_id ON governance_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_governance_votes_voter_address ON governance_votes(voter_address);
CREATE INDEX IF NOT EXISTS idx_governance_votes_vote_type ON governance_votes(vote_type);

CREATE INDEX IF NOT EXISTS idx_governance_policies_status ON governance_policies(status);
CREATE INDEX IF NOT EXISTS idx_governance_policies_version ON governance_policies(version);

CREATE INDEX IF NOT EXISTS idx_governance_compliance_status ON governance_compliance(status);
CREATE INDEX IF NOT EXISTS idx_governance_compliance_date ON governance_compliance(date);
CREATE INDEX IF NOT EXISTS idx_governance_compliance_type ON governance_compliance(type);

-- RLS Policies

-- Governance proposals - admin access for write, authenticated for read
CREATE POLICY "Service role can manage governance proposals"
  ON governance_proposals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read governance proposals"
  ON governance_proposals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create governance proposals"
  ON governance_proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update governance proposals"
  ON governance_proposals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Governance votes - admin access for all, authenticated for read/insert
CREATE POLICY "Service role can manage governance votes"
  ON governance_votes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read governance votes"
  ON governance_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can cast votes"
  ON governance_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Governance policies - admin access only
CREATE POLICY "Service role can manage governance policies"
  ON governance_policies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read governance policies"
  ON governance_policies
  FOR SELECT
  TO authenticated
  USING (true);

-- Governance compliance - admin access only
CREATE POLICY "Service role can manage governance compliance"
  ON governance_compliance
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read governance compliance"
  ON governance_compliance
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to get governance metrics
CREATE OR REPLACE FUNCTION get_governance_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_proposals integer;
  active_proposals integer;
  passed_proposals integer;
  rejected_proposals integer;
  pending_proposals integer;
  avg_participation numeric;
  highest_participation numeric;
  lowest_participation numeric;
  total_votes_cast bigint;
  treasury_proposals integer;
  technical_proposals integer;
  governance_proposals integer;
  community_proposals integer;
BEGIN
  -- Get proposal counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status = 'passed'),
    COUNT(*) FILTER (WHERE status = 'rejected'),
    COUNT(*) FILTER (WHERE status = 'pending')
  INTO
    total_proposals,
    active_proposals,
    passed_proposals,
    rejected_proposals,
    pending_proposals
  FROM governance_proposals;
  
  -- Calculate participation metrics
  WITH participation_data AS (
    SELECT 
      (votes_for + votes_against + votes_abstain)::numeric / quorum::numeric * 100 AS participation_rate
    FROM governance_proposals
    WHERE quorum > 0
  )
  SELECT
    COALESCE(AVG(participation_rate), 0),
    COALESCE(MAX(participation_rate), 0),
    COALESCE(MIN(participation_rate), 0)
  INTO
    avg_participation,
    highest_participation,
    lowest_participation
  FROM participation_data;
  
  -- Get total votes cast
  SELECT COALESCE(SUM(votes_for + votes_against + votes_abstain), 0)
  INTO total_votes_cast
  FROM governance_proposals;
  
  -- Get category distribution
  SELECT
    COUNT(*) FILTER (WHERE category = 'treasury'),
    COUNT(*) FILTER (WHERE category = 'technical'),
    COUNT(*) FILTER (WHERE category = 'governance'),
    COUNT(*) FILTER (WHERE category = 'community')
  INTO
    treasury_proposals,
    technical_proposals,
    governance_proposals,
    community_proposals
  FROM governance_proposals;
  
  -- Build result object
  result := jsonb_build_object(
    'totalProposals', total_proposals,
    'activeProposals', active_proposals,
    'passedProposals', passed_proposals,
    'rejectedProposals', rejected_proposals,
    'pendingProposals', pending_proposals,
    'averageParticipation', avg_participation,
    'highestParticipation', highest_participation,
    'lowestParticipation', lowest_participation,
    'totalVotesCast', total_votes_cast,
    'categoryDistribution', jsonb_build_object(
      'treasury', treasury_proposals,
      'technical', technical_proposals,
      'governance', governance_proposals,
      'community', community_proposals
    )
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return default values on error
    RETURN jsonb_build_object(
      'totalProposals', 0,
      'activeProposals', 0,
      'passedProposals', 0,
      'rejectedProposals', 0,
      'pendingProposals', 0,
      'averageParticipation', 0,
      'highestParticipation', 0,
      'lowestParticipation', 0,
      'totalVotesCast', 0,
      'categoryDistribution', jsonb_build_object(
        'treasury', 0,
        'technical', 0,
        'governance', 0,
        'community', 0
      ),
      'error', SQLERRM
    );
END;
$$;

-- Function to cast a vote
CREATE OR REPLACE FUNCTION cast_governance_vote(
  p_proposal_id uuid,
  p_voter_address text,
  p_vote_type text,
  p_vote_weight integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  proposal_record governance_proposals%ROWTYPE;
BEGIN
  -- Get proposal record
  SELECT * INTO proposal_record FROM governance_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;
  
  -- Check if proposal is active
  IF proposal_record.status != 'active' THEN
    RAISE EXCEPTION 'Proposal is not active';
  END IF;
  
  -- Check if voting period is valid
  IF now() < proposal_record.start_date OR now() > proposal_record.end_date THEN
    RAISE EXCEPTION 'Voting period is not active';
  END IF;
  
  -- Check if voter has already voted
  IF EXISTS (SELECT 1 FROM governance_votes WHERE proposal_id = p_proposal_id AND voter_address = p_voter_address) THEN
    RAISE EXCEPTION 'Voter has already cast a vote for this proposal';
  END IF;
  
  -- Insert vote
  INSERT INTO governance_votes (
    proposal_id,
    voter_address,
    vote_type,
    vote_weight
  ) VALUES (
    p_proposal_id,
    p_voter_address,
    p_vote_type,
    p_vote_weight
  );
  
  -- Update proposal vote counts
  UPDATE governance_proposals
  SET 
    votes_for = CASE WHEN p_vote_type = 'for' THEN votes_for + p_vote_weight ELSE votes_for END,
    votes_against = CASE WHEN p_vote_type = 'against' THEN votes_against + p_vote_weight ELSE votes_against END,
    votes_abstain = CASE WHEN p_vote_type = 'abstain' THEN votes_abstain + p_vote_weight ELSE votes_abstain END,
    updated_at = now()
  WHERE id = p_proposal_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Function to finalize proposal
CREATE OR REPLACE FUNCTION finalize_governance_proposal(
  p_proposal_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  proposal_record governance_proposals%ROWTYPE;
  total_votes integer;
  quorum_reached boolean;
  final_status text;
BEGIN
  -- Get proposal record
  SELECT * INTO proposal_record FROM governance_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;
  
  -- Check if proposal is active
  IF proposal_record.status != 'active' THEN
    RAISE EXCEPTION 'Proposal is not active';
  END IF;
  
  -- Check if voting period has ended
  IF now() <= proposal_record.end_date THEN
    RAISE EXCEPTION 'Voting period has not ended yet';
  END IF;
  
  -- Calculate total votes
  total_votes := proposal_record.votes_for + proposal_record.votes_against + proposal_record.votes_abstain;
  
  -- Check if quorum was reached
  quorum_reached := total_votes >= proposal_record.quorum;
  
  -- Determine final status
  IF NOT quorum_reached THEN
    final_status := 'rejected';
  ELSIF proposal_record.votes_for > proposal_record.votes_against THEN
    final_status := 'passed';
  ELSE
    final_status := 'rejected';
  END IF;
  
  -- Update proposal status
  UPDATE governance_proposals
  SET 
    status = final_status,
    updated_at = now()
  WHERE id = p_proposal_id;
  
  RETURN final_status;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_governance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION cast_governance_vote TO authenticated;
GRANT EXECUTE ON FUNCTION finalize_governance_proposal TO authenticated;

-- Insert sample data
INSERT INTO governance_proposals (
  title,
  description,
  status,
  start_date,
  end_date,
  votes_for,
  votes_against,
  votes_abstain,
  quorum,
  category,
  created_by,
  created_at
) VALUES 
  (
    'Increase Profit Distribution Frequency',
    'Change profit distribution frequency from quarterly to monthly to improve token holder liquidity and engagement.',
    'active',
    '2025-03-15T00:00:00Z',
    '2025-03-22T00:00:00Z',
    750000,
    250000,
    50000,
    1000000,
    'treasury',
    'admin@dronera.eu',
    '2025-03-10T10:30:00Z'
  ),
  (
    'Upgrade H-L.E.V. Propulsion System',
    'Allocate 2.5M EUR from treasury to fund research and development of next-generation H-L.E.V. propulsion system with 30% efficiency improvement.',
    'passed',
    '2025-02-20T00:00:00Z',
    '2025-02-27T00:00:00Z',
    1200000,
    300000,
    100000,
    1000000,
    'technical',
    'admin@dronera.eu',
    '2025-02-15T14:45:00Z'
  ),
  (
    'Expand Whitelist for Institutional Investors',
    'Add 5 new institutional investors to the whitelist to increase capital inflow and strategic partnerships.',
    'rejected',
    '2025-01-10T00:00:00Z',
    '2025-01-17T00:00:00Z',
    400000,
    800000,
    50000,
    1000000,
    'governance',
    'admin@dronera.eu',
    '2025-01-05T09:15:00Z'
  ),
  (
    'Establish Community Development Fund',
    'Create a 1M EUR community development fund to support ecosystem growth and developer engagement.',
    'pending',
    '2025-03-25T00:00:00Z',
    '2025-04-01T00:00:00Z',
    0,
    0,
    0,
    1000000,
    'community',
    'admin@dronera.eu',
    '2025-03-20T16:30:00Z'
  ),
  (
    'Modify Token Vesting Schedule',
    'Adjust vesting schedule to extend cliff period from 6 to 9 months for better long-term alignment.',
    'active',
    '2025-03-10T00:00:00Z',
    '2025-03-17T00:00:00Z',
    600000,
    400000,
    100000,
    1000000,
    'governance',
    'admin@dronera.eu',
    '2025-03-05T11:20:00Z'
  )
ON CONFLICT DO NOTHING;

INSERT INTO governance_policies (
  title,
  content,
  version,
  status,
  created_by,
  created_at,
  last_updated
) VALUES
  (
    'Governance Framework v2.1',
    'This document outlines the governance framework for the DRONERA platform...',
    '2.1',
    'active',
    'admin@dronera.eu',
    '2025-02-15T10:30:00Z',
    '2025-02-15T10:30:00Z'
  ),
  (
    'Voting Procedures',
    'This document details the procedures for submitting and voting on governance proposals...',
    '1.3',
    'active',
    'admin@dronera.eu',
    '2025-01-20T14:45:00Z',
    '2025-01-20T14:45:00Z'
  ),
  (
    'Treasury Management Guidelines',
    'This document outlines the guidelines for managing the DRONERA treasury...',
    '2.0',
    'active',
    'admin@dronera.eu',
    '2025-02-10T09:15:00Z',
    '2025-02-10T09:15:00Z'
  ),
  (
    'Proposal Submission Requirements',
    'This document details the requirements for submitting governance proposals...',
    '1.2',
    'active',
    'admin@dronera.eu',
    '2024-12-05T16:30:00Z',
    '2024-12-05T16:30:00Z'
  ),
  (
    'Conflict Resolution Process',
    'This document outlines the process for resolving conflicts in the governance process...',
    '1.0',
    'active',
    'admin@dronera.eu',
    '2024-11-15T11:20:00Z',
    '2024-11-15T11:20:00Z'
  )
ON CONFLICT DO NOTHING;

INSERT INTO governance_compliance (
  type,
  date,
  status,
  details,
  performed_by,
  created_at
) VALUES
  (
    'Quarterly Governance Audit',
    '2025-03-15T10:30:00Z',
    'compliant',
    'All governance processes found to be compliant with regulatory requirements.',
    'admin@dronera.eu',
    '2025-03-15T10:30:00Z'
  ),
  (
    'Voting System Security Audit',
    '2025-02-20T14:45:00Z',
    'compliant',
    'Security audit passed with minor recommendations for improvement.',
    'admin@dronera.eu',
    '2025-02-20T14:45:00Z'
  ),
  (
    'Treasury Management Review',
    '2025-01-10T09:15:00Z',
    'compliant',
    'Treasury management practices found to be compliant with internal policies.',
    'admin@dronera.eu',
    '2025-01-10T09:15:00Z'
  ),
  (
    'Proposal Process Compliance Check',
    '2025-03-25T16:30:00Z',
    'pending',
    'Scheduled compliance check for proposal submission and voting processes.',
    'admin@dronera.eu',
    '2025-03-25T16:30:00Z'
  ),
  (
    'Governance Framework Review',
    '2025-03-10T11:20:00Z',
    'non-compliant',
    'Minor issues found in documentation. Remediation plan in place.',
    'admin@dronera.eu',
    '2025-03-10T11:20:00Z'
  )
ON CONFLICT DO NOTHING;