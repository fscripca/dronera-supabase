-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to recreate them properly
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Create comprehensive storage policies for documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Drop existing admin_documents policies to recreate them properly
DROP POLICY IF EXISTS "Authenticated users can insert admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can read admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can update admin documents" ON admin_documents;
DROP POLICY IF EXISTS "Authenticated users can delete admin documents" ON admin_documents;

-- Create proper RLS policies for admin_documents table
CREATE POLICY "Authenticated users can insert admin documents"
ON admin_documents
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can read admin documents"
ON admin_documents
FOR SELECT
TO authenticated
USING (true);

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

-- Drop existing functions first to avoid return type errors
DROP FUNCTION IF EXISTS get_admin_documents();
DROP FUNCTION IF EXISTS create_admin_document(text, text, text, text, integer, text, text, text, text);
DROP FUNCTION IF EXISTS update_admin_document(uuid, text, text, text, text, integer, text, text, text);
DROP FUNCTION IF EXISTS delete_admin_document(uuid);

-- Create RPC function to get all admin documents
CREATE OR REPLACE FUNCTION get_admin_documents()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  file_path text,
  file_size integer,
  file_type text,
  status text,
  visibility text,
  created_at timestamptz,
  updated_at timestamptz,
  created_by text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description,
    d.category,
    d.file_path,
    d.file_size,
    d.file_type,
    d.status,
    d.visibility,
    d.created_at,
    d.updated_at,
    d.created_by
  FROM admin_documents d
  ORDER BY d.created_at DESC;
END;
$$;

-- Create RPC function to create admin document
CREATE OR REPLACE FUNCTION create_admin_document(
  p_title text,
  p_description text DEFAULT '',
  p_category text DEFAULT 'Other',
  p_file_path text DEFAULT '',
  p_file_size integer DEFAULT 0,
  p_file_type text DEFAULT 'application/octet-stream',
  p_status text DEFAULT 'Active',
  p_visibility text DEFAULT 'all',
  p_created_by text DEFAULT 'admin'
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  file_path text,
  file_size integer,
  file_type text,
  status text,
  visibility text,
  created_at timestamptz,
  updated_at timestamptz,
  created_by text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_doc_id uuid;
BEGIN
  -- Validate required fields
  IF p_title IS NULL OR p_title = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  
  IF p_category NOT IN ('Financial', 'Legal', 'Reports', 'Other') THEN
    RAISE EXCEPTION 'Invalid category. Must be one of: Financial, Legal, Reports, Other';
  END IF;
  
  IF p_status NOT IN ('Active', 'Inactive') THEN
    RAISE EXCEPTION 'Invalid status. Must be Active or Inactive';
  END IF;
  
  IF p_visibility NOT IN ('all', 'accredited', 'institutional') THEN
    RAISE EXCEPTION 'Invalid visibility. Must be one of: all, accredited, institutional';
  END IF;

  -- Insert the new document
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
  ) VALUES (
    p_title,
    p_description,
    p_category,
    p_file_path,
    p_file_size,
    p_file_type,
    p_status,
    p_visibility,
    p_created_by
  ) RETURNING admin_documents.id INTO new_doc_id;

  -- Return the created document
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description,
    d.category,
    d.file_path,
    d.file_size,
    d.file_type,
    d.status,
    d.visibility,
    d.created_at,
    d.updated_at,
    d.created_by
  FROM admin_documents d
  WHERE d.id = new_doc_id;
END;
$$;

-- Create RPC function to update admin document
CREATE OR REPLACE FUNCTION update_admin_document(
  p_id uuid,
  p_title text,
  p_description text DEFAULT '',
  p_category text DEFAULT 'Other',
  p_file_path text DEFAULT '',
  p_file_size integer DEFAULT 0,
  p_file_type text DEFAULT 'application/octet-stream',
  p_status text DEFAULT 'Active',
  p_visibility text DEFAULT 'all'
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  file_path text,
  file_size integer,
  file_type text,
  status text,
  visibility text,
  created_at timestamptz,
  updated_at timestamptz,
  created_by text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate required fields
  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Document ID is required';
  END IF;
  
  IF p_title IS NULL OR p_title = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  
  IF p_category NOT IN ('Financial', 'Legal', 'Reports', 'Other') THEN
    RAISE EXCEPTION 'Invalid category. Must be one of: Financial, Legal, Reports, Other';
  END IF;
  
  IF p_status NOT IN ('Active', 'Inactive') THEN
    RAISE EXCEPTION 'Invalid status. Must be Active or Inactive';
  END IF;
  
  IF p_visibility NOT IN ('all', 'accredited', 'institutional') THEN
    RAISE EXCEPTION 'Invalid visibility. Must be one of: all, accredited, institutional';
  END IF;

  -- Check if document exists
  IF NOT EXISTS (SELECT 1 FROM admin_documents WHERE admin_documents.id = p_id) THEN
    RAISE EXCEPTION 'Document with ID % not found', p_id;
  END IF;

  -- Update the document
  UPDATE admin_documents SET
    title = p_title,
    description = p_description,
    category = p_category,
    file_path = p_file_path,
    file_size = p_file_size,
    file_type = p_file_type,
    status = p_status,
    visibility = p_visibility,
    updated_at = now()
  WHERE admin_documents.id = p_id;

  -- Return the updated document
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description,
    d.category,
    d.file_path,
    d.file_size,
    d.file_type,
    d.status,
    d.visibility,
    d.created_at,
    d.updated_at,
    d.created_by
  FROM admin_documents d
  WHERE d.id = p_id;
END;
$$;

-- Create RPC function to delete admin document
CREATE OR REPLACE FUNCTION delete_admin_document(p_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  file_path text,
  file_size integer,
  file_type text,
  status text,
  visibility text,
  created_at timestamptz,
  updated_at timestamptz,
  created_by text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_doc admin_documents%ROWTYPE;
BEGIN
  -- Validate required fields
  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Document ID is required';
  END IF;

  -- Check if document exists and get its data before deletion
  SELECT * INTO deleted_doc FROM admin_documents WHERE admin_documents.id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document with ID % not found', p_id;
  END IF;

  -- Delete the document
  DELETE FROM admin_documents WHERE admin_documents.id = p_id;

  -- Return the deleted document data
  RETURN QUERY
  SELECT 
    deleted_doc.id,
    deleted_doc.title,
    deleted_doc.description,
    deleted_doc.category,
    deleted_doc.file_path,
    deleted_doc.file_size,
    deleted_doc.file_type,
    deleted_doc.status,
    deleted_doc.visibility,
    deleted_doc.created_at,
    deleted_doc.updated_at,
    deleted_doc.created_by;
END;
$$;

-- Grant execute permissions on the RPC functions
GRANT EXECUTE ON FUNCTION get_admin_documents() TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_document(text, text, text, text, integer, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_document(uuid, text, text, text, text, integer, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_admin_document(uuid) TO authenticated;

-- Grant execute permissions to service_role as well for Edge Functions
GRANT EXECUTE ON FUNCTION get_admin_documents() TO service_role;
GRANT EXECUTE ON FUNCTION create_admin_document(text, text, text, text, integer, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION update_admin_document(uuid, text, text, text, text, integer, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION delete_admin_document(uuid) TO service_role;

-- Ensure RLS is enabled on admin_documents table
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;

-- Create index for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_admin_documents_title ON admin_documents(title);
CREATE INDEX IF NOT EXISTS idx_admin_documents_file_path ON admin_documents(file_path);