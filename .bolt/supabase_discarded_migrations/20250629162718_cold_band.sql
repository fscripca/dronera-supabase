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

-- Enable RLS
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_admin_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at column
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

-- RLS Policies for admin_documents - Add IF NOT EXISTS to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_documents' AND policyname = 'Admin users can select documents'
  ) THEN
    CREATE POLICY "Admin users can select documents"
      ON admin_documents
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_documents' AND policyname = 'Admin users can insert documents'
  ) THEN
    CREATE POLICY "Admin users can insert documents"
      ON admin_documents
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_documents' AND policyname = 'Admin users can update documents'
  ) THEN
    CREATE POLICY "Admin users can update documents"
      ON admin_documents
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_documents' AND policyname = 'Admin users can delete documents'
  ) THEN
    CREATE POLICY "Admin users can delete documents"
      ON admin_documents
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_documents' AND policyname = 'Service role can manage all documents'
  ) THEN
    CREATE POLICY "Service role can manage all documents"
      ON admin_documents
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Create document_access_logs table for tracking document access
CREATE TABLE IF NOT EXISTS document_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES admin_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  access_time timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on document_access_logs
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for document_access_logs
CREATE INDEX IF NOT EXISTS idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_user_id ON document_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_access_time ON document_access_logs(access_time);

-- RLS Policies for document_access_logs - Add IF NOT EXISTS to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_access_logs' AND policyname = 'Service role can manage all access logs'
  ) THEN
    CREATE POLICY "Service role can manage all access logs"
      ON document_access_logs
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_access_logs' AND policyname = 'Authenticated users can read their own access logs'
  ) THEN
    CREATE POLICY "Authenticated users can read their own access logs"
      ON document_access_logs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_access_logs' AND policyname = 'Authenticated users can insert access logs'
  ) THEN
    CREATE POLICY "Authenticated users can insert access logs"
      ON document_access_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END
$$;

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
    'Q1 2025 Financial Report',
    'Quarterly financial report for Q1 2025',
    'Financial',
    '/documents/q1-2025-financial-report.pdf',
    2500000,
    'application/pdf',
    'Active',
    'all',
    'admin@dronera.eu'
  ),
  (
    'Joint Venture Agreement',
    'Legal agreement for the joint venture partnership',
    'Legal',
    '/documents/jv-agreement.pdf',
    3500000,
    'application/pdf',
    'Active',
    'accredited',
    'admin@dronera.eu'
  ),
  (
    'Technical Whitepaper',
    'Technical details of the H-L.E.V. propulsion system',
    'Reports',
    '/documents/technical-whitepaper.pdf',
    5000000,
    'application/pdf',
    'Active',
    'all',
    'admin@dronera.eu'
  )
ON CONFLICT DO NOTHING;