/*
  # Fix Governance Proposals and Archive Setup

  1. New Tables
    - Ensures governance_proposals_archive exists with proper structure
  
  2. Security
    - Enables RLS on governance tables
    - Creates proper policies with correct permissions
  
  3. Changes
    - Fixes orphaned proposals by ensuring proper metadata
    - Creates backup tables for safety
    - Adds necessary indexes for performance
*/

-- Create backup table for governance proposals if needed
CREATE TABLE IF NOT EXISTS governance_proposals_backup AS 
SELECT * FROM governance_proposals;

-- Ensure RLS is enabled
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can create governance proposals" ON governance_proposals;
DROP POLICY IF EXISTS "Authenticated users can read governance proposals" ON governance_proposals;
DROP POLICY IF EXISTS "Authenticated users can update governance proposals" ON governance_proposals;
DROP POLICY IF EXISTS "Service role can manage governance proposals" ON governance_proposals;

-- Create proper RLS policies with correct permissions
CREATE POLICY "Authenticated users can create governance proposals"
  ON governance_proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read governance proposals"
  ON governance_proposals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update governance proposals"
  ON governance_proposals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage governance proposals"
  ON governance_proposals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix any orphaned proposals by ensuring they have proper metadata
UPDATE governance_proposals
SET 
  updated_at = now(),
  created_at = COALESCE(created_at, now())
WHERE 
  created_at IS NULL OR updated_at IS NULL;

-- Ensure all proposals have the required fields
UPDATE governance_proposals
SET
  description = COALESCE(description, 'No description provided'),
  votes_for = COALESCE(votes_for, 0),
  votes_against = COALESCE(votes_against, 0),
  votes_abstain = COALESCE(votes_abstain, 0)
WHERE
  description IS NULL OR
  votes_for IS NULL OR
  votes_against IS NULL OR
  votes_abstain IS NULL;

-- Create archive table for old proposals if it doesn't exist
CREATE TABLE IF NOT EXISTS governance_proposals_archive (
  id uuid NOT NULL PRIMARY KEY,
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

-- Create policies for archive table only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Authenticated users can read archived proposals' 
    AND polrelid = 'governance_proposals_archive'::regclass
  ) THEN
    CREATE POLICY "Authenticated users can read archived proposals"
      ON governance_proposals_archive
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Service role can manage archived proposals' 
    AND polrelid = 'governance_proposals_archive'::regclass
  ) THEN
    CREATE POLICY "Service role can manage archived proposals"
      ON governance_proposals_archive
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Create indexes for archive table if they don't exist
CREATE INDEX IF NOT EXISTS idx_governance_proposals_archive_status ON governance_proposals_archive(status);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_archive_archived_at ON governance_proposals_archive(archived_at);

-- Create backup tables for votes if needed
CREATE TABLE IF NOT EXISTS governance_votes_backup AS 
SELECT * FROM governance_votes;