/*
  # Add Additional Fields to Governance Proposals Table

  1. Table Updates
    - Add `proposed_changes` column to store specific changes being proposed
    - Add `implementation_timeline` column for implementation details
    - Add `expected_impact` column for impact assessment

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for new fields

  3. Indexes
    - No new indexes needed for these text fields
*/

-- Add new columns to governance_proposals table
ALTER TABLE governance_proposals 
ADD COLUMN IF NOT EXISTS proposed_changes text,
ADD COLUMN IF NOT EXISTS implementation_timeline text,
ADD COLUMN IF NOT EXISTS expected_impact text;

-- Comment on new columns
COMMENT ON COLUMN governance_proposals.proposed_changes IS 'Specific changes being proposed';
COMMENT ON COLUMN governance_proposals.implementation_timeline IS 'Timeline for implementing the proposal if passed';
COMMENT ON COLUMN governance_proposals.expected_impact IS 'Expected impact of the proposal on the project';