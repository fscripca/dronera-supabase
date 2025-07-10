/*
  # Fix Admin Documents RLS Policies

  1. Policy Updates
    - Drop existing conflicting policies
    - Create new comprehensive policies for authenticated users
    - Ensure proper access control for CRUD operations

  2. Security
    - Enable RLS on admin_documents table
    - Allow authenticated users full access to admin documents
    - Maintain security while fixing access issues
*/

-- Drop existing policies that may be causing conflicts
DROP POLICY IF EXISTS "Anonymous users cannot access admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can create admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can delete admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can read admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can update admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Service role can manage all admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Service role can manage all documents" ON admin_documents;

-- Ensure RLS is enabled
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for authenticated users
CREATE POLICY "Authenticated users can read admin documents"
  ON admin_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert admin documents"
  ON admin_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update admin documents"
  ON admin_documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete admin documents"
  ON admin_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Service role policies for backend operations
CREATE POLICY "Service role can manage all admin documents"
  ON admin_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);