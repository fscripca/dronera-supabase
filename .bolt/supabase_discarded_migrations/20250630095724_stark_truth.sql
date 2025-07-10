-- Fix governance proposals display in admin page
-- This migration ensures proposals are properly displayed and maintained until deleted

-- First, ensure we have the correct RLS policies for governance_proposals
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

-- Create function to ensure proposals are properly synced between user and admin views
CREATE OR REPLACE FUNCTION sync_governance_proposals()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger function ensures that any changes to proposals are properly tracked
  -- It will be called on INSERT, UPDATE, and DELETE operations
  
  -- For audit purposes, log the operation
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    timestamp
  ) VALUES (
    COALESCE(auth.uid()::text, 'system'),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'PROPOSAL_CREATED'
      WHEN TG_OP = 'UPDATE' THEN 'PROPOSAL_UPDATED'
      WHEN TG_OP = 'DELETE' THEN 'PROPOSAL_DELETED'
      ELSE 'PROPOSAL_MODIFIED'
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Created proposal: ' || NEW.title
      WHEN TG_OP = 'UPDATE' THEN 'Updated proposal: ' || NEW.title
      WHEN TG_OP = 'DELETE' THEN 'Deleted proposal: ' || OLD.title
      ELSE 'Modified proposal'
    END,
    now()
  );
  
  -- Return the appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS governance_proposals_sync_trigger ON governance_proposals;
CREATE TRIGGER governance_proposals_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION sync_governance_proposals();

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

-- Create function to get all governance proposals (for admin and user views)
CREATE OR REPLACE FUNCTION get_all_governance_proposals()
RETURNS SETOF governance_proposals
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM governance_proposals ORDER BY created_at DESC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_all_governance_proposals() TO authenticated, service_role;