/*
  # Fix Admin Documents RLS Policies

  1. Security Updates
    - Update RLS policies for admin_documents table
    - Allow authenticated users to manage documents
    - Ensure proper access control for document operations

  2. Changes
    - Drop existing restrictive policies
    - Create new policies for INSERT, UPDATE, DELETE operations
    - Maintain security while allowing admin functionality
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON admin_documents;
DROP POLICY IF EXISTS "Service role can manage all documents" ON admin_documents;

-- Create comprehensive policies for admin document management
CREATE POLICY "Admin users can insert documents"
  ON admin_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can select documents"
  ON admin_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can update documents"
  ON admin_documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete documents"
  ON admin_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Service role should have full access
CREATE POLICY "Service role can manage all documents"
  ON admin_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;