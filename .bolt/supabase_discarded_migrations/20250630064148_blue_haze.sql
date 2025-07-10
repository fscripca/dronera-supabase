/*
  # Ensure Admin Documents Setup

  1. Tables
    - Verify `admin_documents` table exists with correct structure
    - Verify `admin_audit_logs` table exists with correct structure
    - Add any missing indexes for performance
  
  2. Security
    - Ensure RLS policies are correctly configured
    - Add service role permissions
  
  3. Functions
    - Ensure trigger functions exist for updated_at columns
*/

-- Ensure admin_documents table exists with correct structure
CREATE TABLE IF NOT EXISTS admin_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category = ANY (ARRAY['Financial'::text, 'Legal'::text, 'Reports'::text, 'Other'::text])),
  file_path text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT 'application/octet-stream',
  status text NOT NULL DEFAULT 'Active' CHECK (status = ANY (ARRAY['Active'::text, 'Inactive'::text])),
  visibility text NOT NULL DEFAULT 'all' CHECK (visibility = ANY (ARRAY['all'::text, 'accredited'::text, 'institutional'::text])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

-- Ensure admin_audit_logs table exists
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text NOT NULL,
  action text NOT NULL,
  details text NOT NULL,
  ip_address text DEFAULT 'unknown',
  user_agent text DEFAULT 'unknown',
  timestamp timestamptz DEFAULT now()
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_admin_documents_category ON admin_documents (category);
CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents (status);
CREATE INDEX IF NOT EXISTS idx_admin_documents_visibility ON admin_documents (visibility);
CREATE INDEX IF NOT EXISTS idx_admin_documents_created_at ON admin_documents (created_at);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON admin_audit_logs (timestamp);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists for admin_documents
DROP TRIGGER IF EXISTS update_admin_documents_updated_at ON admin_documents;
CREATE TRIGGER update_admin_documents_updated_at
    BEFORE UPDATE ON admin_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on both tables
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Service role can manage all admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can read admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can create admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can update admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can delete admin documents" ON admin_documents;

DROP POLICY IF EXISTS "Service role can manage all audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON admin_audit_logs;

-- Create comprehensive RLS policies for admin_documents
CREATE POLICY "Service role can manage all admin documents"
  ON admin_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read admin documents"
  ON admin_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create admin documents"
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

-- Create comprehensive RLS policies for admin_audit_logs
CREATE POLICY "Service role can manage all audit logs"
  ON admin_audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert audit logs"
  ON admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);