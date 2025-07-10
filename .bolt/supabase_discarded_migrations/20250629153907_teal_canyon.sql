/*
  # Create Admin Documents Management Table

  1. New Tables
    - `admin_documents` - Stores document information for investor access
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `category` (text, enum: Financial/Legal/Reports/Other)
      - `file_path` (text, required)
      - `file_size` (integer, required)
      - `file_type` (text, required)
      - `status` (text, enum: Active/Inactive)
      - `visibility` (text, enum: all/accredited/institutional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (text, admin email)

  2. Security
    - Enable RLS on `admin_documents` table
    - Add policies for admin access
    - Add policies for investor access based on visibility

  3. Functions
    - Function to get documents for a specific investor
    - Function to log document access
*/

-- Create admin_documents table
CREATE TABLE IF NOT EXISTS admin_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('Financial', 'Legal', 'Reports', 'Other')),
  file_path text NOT NULL,
  file_size integer NOT NULL,
  file_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('Active', 'Inactive')),
  visibility text NOT NULL CHECK (visibility IN ('all', 'accredited', 'institutional')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

-- Create document_access_logs table
CREATE TABLE IF NOT EXISTS document_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES admin_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  access_time timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_admin_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_documents_updated_at ON admin_documents;
CREATE TRIGGER update_admin_documents_updated_at
  BEFORE UPDATE ON admin_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_documents_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_documents_category ON admin_documents(category);
CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents(status);
CREATE INDEX IF NOT EXISTS idx_admin_documents_visibility ON admin_documents(visibility);
CREATE INDEX IF NOT EXISTS idx_admin_documents_created_at ON admin_documents(created_at);

CREATE INDEX IF NOT EXISTS idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_user_id ON document_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_access_time ON document_access_logs(access_time);

-- RLS Policies for admin_documents

-- Service role can manage all documents
CREATE POLICY "Service role can manage all documents"
  ON admin_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users (admins) can manage documents
CREATE POLICY "Authenticated users can manage documents"
  ON admin_documents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for document_access_logs

-- Service role can manage all access logs
CREATE POLICY "Service role can manage all access logs"
  ON document_access_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can insert access logs
CREATE POLICY "Authenticated users can insert access logs"
  ON document_access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can read their own access logs
CREATE POLICY "Authenticated users can read their own access logs"
  ON document_access_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to get documents for a specific investor
CREATE OR REPLACE FUNCTION get_investor_documents(p_user_id uuid)
RETURNS SETOF admin_documents
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  investor_tier text;
BEGIN
  -- Get investor tier from profiles or token_holders
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM token_holders WHERE user_id = p_user_id AND investment_tier = 'institutional') THEN 'institutional'
      WHEN EXISTS (SELECT 1 FROM token_holders WHERE user_id = p_user_id AND investment_tier = 'accredited') THEN 'accredited'
      ELSE 'retail'
    END INTO investor_tier;
  
  -- Return documents based on visibility and status
  RETURN QUERY
  SELECT * FROM admin_documents
  WHERE status = 'Active'
  AND (
    visibility = 'all'
    OR (visibility = 'accredited' AND investor_tier IN ('accredited', 'institutional'))
    OR (visibility = 'institutional' AND investor_tier = 'institutional')
  )
  ORDER BY created_at DESC;
END;
$$;

-- Function to log document access
CREATE OR REPLACE FUNCTION log_document_access(
  p_document_id uuid,
  p_user_id uuid,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO document_access_logs (
    document_id,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    p_document_id,
    p_user_id,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_investor_documents TO authenticated;
GRANT EXECUTE ON FUNCTION log_document_access TO authenticated;

-- Insert sample documents
INSERT INTO admin_documents (
  title,
  description,
  category,
  file_path,
  file_size,
  file_type,
  status,
  visibility,
  created_by
) VALUES 
  (
    'Security Token Purchase Agreement',
    'Legal agreement governing the purchase and ownership of DRONE tokens.',
    'Legal',
    '/documents/security-token-purchase-agreement.pdf',
    2500000,
    'application/pdf',
    'Active',
    'all',
    'admin@dronera.eu'
  ),
  (
    'Token Holder Rights',
    'Detailed explanation of rights, privileges, and obligations of DRONE token holders.',
    'Legal',
    '/documents/token-holder-rights.pdf',
    1800000,
    'application/pdf',
    'Active',
    'all',
    'admin@dronera.eu'
  ),
  (
    'Q1 2025 Financial Report',
    'Quarterly financial report for Q1 2025.',
    'Financial',
    '/documents/q1-2025-financial-report.pdf',
    3200000,
    'application/pdf',
    'Active',
    'all',
    'admin@dronera.eu'
  ),
  (
    'H-L.E.V. Propulsion Technical Whitepaper',
    'Technical whitepaper on H-L.E.V. propulsion technology.',
    'Reports',
    '/documents/hlev-whitepaper.pdf',
    5700000,
    'application/pdf',
    'Active',
    'all',
    'admin@dronera.eu'
  ),
  (
    'Joint Venture Agreement - EARI',
    'Joint Venture Agreement between DRONERA and European Aerospace Research Institute.',
    'Legal',
    '/documents/jv-agreement-eari.pdf',
    4100000,
    'application/pdf',
    'Active',
    'accredited',
    'admin@dronera.eu'
  ),
  (
    'Q-OS Security Architecture',
    'Detailed documentation on Q-OS security architecture.',
    'Reports',
    '/documents/qos-security-architecture.pdf',
    3800000,
    'application/pdf',
    'Active',
    'institutional',
    'admin@dronera.eu'
  ),
  (
    'Investor Onboarding Guide',
    'Guide for new investors on the DRONERA platform.',
    'Other',
    '/documents/investor-onboarding-guide.pdf',
    1200000,
    'application/pdf',
    'Active',
    'all',
    'admin@dronera.eu'
  ),
  (
    'Profit Distribution Schedule 2025',
    'Schedule of profit distributions for 2025.',
    'Financial',
    '/documents/profit-distribution-schedule-2025.xlsx',
    900000,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Active',
    'all',
    'admin@dronera.eu'
  )
ON CONFLICT DO NOTHING;