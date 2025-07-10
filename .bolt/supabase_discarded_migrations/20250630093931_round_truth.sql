-- Create backup of governance tables before cleanup
CREATE TABLE IF NOT EXISTS governance_proposals_backup AS 
SELECT * FROM governance_proposals;

CREATE TABLE IF NOT EXISTS governance_votes_backup AS 
SELECT * FROM governance_votes;

-- Create archive table for old proposals
CREATE TABLE IF NOT EXISTS governance_proposals_archive (
  id uuid PRIMARY KEY,
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
  updated_at timestamptz DEFAULT now(),
  proposed_changes text,
  implementation_timeline text,
  expected_impact text,
  archived_at timestamptz DEFAULT now(),
  archive_reason text DEFAULT 'Age-based archival'
);

-- Enable RLS on archive table
ALTER TABLE governance_proposals_archive ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for archive table
CREATE POLICY "Service role can manage archived proposals"
  ON governance_proposals_archive
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read archived proposals"
  ON governance_proposals_archive
  FOR SELECT
  TO authenticated
  USING (true);

-- Move old completed or expired proposals to archive
INSERT INTO governance_proposals_archive
SELECT 
  p.*,
  now() as archived_at,
  CASE
    WHEN p.status = 'passed' THEN 'Completed proposal older than 12 months'
    WHEN p.status = 'rejected' THEN 'Rejected proposal older than 12 months'
    ELSE 'Expired proposal older than 12 months'
  END as archive_reason
FROM governance_proposals p
WHERE 
  (p.status IN ('passed', 'rejected') AND p.updated_at < now() - interval '12 months')
  OR (p.status = 'active' AND p.end_date < now() - interval '12 months');

-- Delete archived proposals from main table
DELETE FROM governance_proposals
WHERE 
  (status IN ('passed', 'rejected') AND updated_at < now() - interval '12 months')
  OR (status = 'active' AND end_date < now() - interval '12 months');

-- Remove duplicate proposals (keeping the most recently updated one)
WITH duplicates AS (
  SELECT 
    id,
    title,
    ROW_NUMBER() OVER (PARTITION BY title, description ORDER BY updated_at DESC) as row_num
  FROM governance_proposals
)
DELETE FROM governance_proposals
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Update status for proposals with inconsistent state
UPDATE governance_proposals
SET 
  status = 'passed',
  updated_at = now()
WHERE 
  status = 'active' 
  AND end_date < now() 
  AND votes_for > votes_against
  AND (votes_for + votes_against + votes_abstain) >= quorum;

UPDATE governance_proposals
SET 
  status = 'rejected',
  updated_at = now()
WHERE 
  status = 'active' 
  AND end_date < now() 
  AND (votes_for <= votes_against OR (votes_for + votes_against + votes_abstain) < quorum);

-- Fix any null values in required fields
UPDATE governance_proposals
SET 
  description = COALESCE(description, 'No description provided'),
  votes_for = COALESCE(votes_for, 0),
  votes_against = COALESCE(votes_against, 0),
  votes_abstain = COALESCE(votes_abstain, 0),
  quorum = COALESCE(quorum, 1000000),
  updated_at = now()
WHERE 
  description IS NULL 
  OR votes_for IS NULL 
  OR votes_against IS NULL 
  OR votes_abstain IS NULL
  OR quorum IS NULL;

-- Ensure all timestamps are valid
UPDATE governance_proposals
SET 
  created_at = now(),
  updated_at = now()
WHERE 
  created_at IS NULL 
  OR updated_at IS NULL
  OR created_at > now()
  OR updated_at > now();

-- Ensure start_date is before end_date
UPDATE governance_proposals
SET 
  end_date = start_date + interval '7 days',
  updated_at = now()
WHERE start_date >= end_date;

-- Create function to finalize expired proposals
CREATE OR REPLACE FUNCTION finalize_expired_proposals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer := 0;
BEGIN
  -- Update proposals that have ended but still have 'active' status
  WITH updated_rows AS (
    UPDATE governance_proposals
    SET 
      status = CASE 
        WHEN votes_for > votes_against AND (votes_for + votes_against + votes_abstain) >= quorum THEN 'passed'
        ELSE 'rejected'
      END,
      updated_at = now()
    WHERE 
      status = 'active' 
      AND end_date < now()
    RETURNING *
  )
  SELECT COUNT(*) INTO updated_count FROM updated_rows;
  
  RETURN updated_count;
END;
$$;

-- Create function to get governance proposal statistics
CREATE OR REPLACE FUNCTION get_governance_proposal_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_proposals', COUNT(*),
    'active_proposals', COUNT(*) FILTER (WHERE status = 'active'),
    'passed_proposals', COUNT(*) FILTER (WHERE status = 'passed'),
    'rejected_proposals', COUNT(*) FILTER (WHERE status = 'rejected'),
    'pending_proposals', COUNT(*) FILTER (WHERE status = 'pending'),
    'archived_proposals', (SELECT COUNT(*) FROM governance_proposals_archive),
    'proposals_by_category', jsonb_build_object(
      'treasury', COUNT(*) FILTER (WHERE category = 'treasury'),
      'technical', COUNT(*) FILTER (WHERE category = 'technical'),
      'governance', COUNT(*) FILTER (WHERE category = 'governance'),
      'community', COUNT(*) FILTER (WHERE category = 'community')
    ),
    'avg_participation', (
      SELECT COALESCE(AVG((votes_for + votes_against + votes_abstain)::numeric / quorum::numeric * 100), 0)
      FROM governance_proposals
      WHERE quorum > 0
    ),
    'last_updated', now()
  ) INTO result
  FROM governance_proposals;
  
  RETURN result;
END;
$$;

-- Create indexes for improved performance
DROP INDEX IF EXISTS idx_governance_proposals_status;
DROP INDEX IF EXISTS idx_governance_proposals_category;
DROP INDEX IF EXISTS idx_governance_proposals_created_at;
DROP INDEX IF EXISTS idx_governance_proposals_start_date;
DROP INDEX IF EXISTS idx_governance_proposals_end_date;

CREATE INDEX IF NOT EXISTS idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_category ON governance_proposals(category);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_created_at ON governance_proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_start_date ON governance_proposals(start_date);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_end_date ON governance_proposals(end_date);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_created_by ON governance_proposals(created_by);

-- Create index on archive table
CREATE INDEX IF NOT EXISTS idx_governance_proposals_archive_status ON governance_proposals_archive(status);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_archive_archived_at ON governance_proposals_archive(archived_at);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION finalize_expired_proposals() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_governance_proposal_stats() TO authenticated, service_role;

-- Run the finalization function to update any currently expired proposals
SELECT finalize_expired_proposals();

-- Create a validation function to check database integrity
CREATE OR REPLACE FUNCTION validate_governance_database()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  invalid_proposals integer;
  orphaned_votes integer;
  inconsistent_status integer;
BEGIN
  -- Check for invalid proposals (missing required fields)
  SELECT COUNT(*) INTO invalid_proposals
  FROM governance_proposals
  WHERE 
    title IS NULL OR 
    description IS NULL OR
    status IS NULL OR
    start_date IS NULL OR
    end_date IS NULL OR
    quorum IS NULL OR
    category IS NULL OR
    created_by IS NULL;
  
  -- Check for orphaned votes (votes for non-existent proposals)
  SELECT COUNT(*) INTO orphaned_votes
  FROM governance_votes v
  LEFT JOIN governance_proposals p ON v.proposal_id = p.id
  WHERE p.id IS NULL;
  
  -- Check for proposals with inconsistent status
  SELECT COUNT(*) INTO inconsistent_status
  FROM governance_proposals
  WHERE 
    (status = 'active' AND end_date < now()) OR
    (status IN ('passed', 'rejected') AND end_date > now());
  
  -- Build result object
  result := jsonb_build_object(
    'validation_time', now(),
    'issues_found', (invalid_proposals > 0 OR orphaned_votes > 0 OR inconsistent_status > 0),
    'invalid_proposals', invalid_proposals,
    'orphaned_votes', orphaned_votes,
    'inconsistent_status', inconsistent_status,
    'total_proposals', (SELECT COUNT(*) FROM governance_proposals),
    'total_votes', (SELECT COUNT(*) FROM governance_votes),
    'archived_proposals', (SELECT COUNT(*) FROM governance_proposals_archive)
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION validate_governance_database() TO authenticated, service_role;

-- Run validation to check database integrity after cleanup
SELECT validate_governance_database();