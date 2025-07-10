/*
  # Create Admin Document Management Functions

  1. New Functions
    - `get_admin_documents()` - Retrieve all admin documents
    - `create_admin_document()` - Create a new admin document
    - `update_admin_document()` - Update an existing admin document
    - `delete_admin_document()` - Delete an admin document

  2. Security
    - All functions use SECURITY DEFINER to bypass RLS
    - Functions execute with elevated privileges to manage documents
    - Proper parameter validation and error handling
*/

-- Function to get all admin documents
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
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ad.id,
    ad.title,
    ad.description,
    ad.category,
    ad.file_path,
    ad.file_size,
    ad.file_type,
    ad.status,
    ad.visibility,
    ad.created_at,
    ad.updated_at,
    ad.created_by
  FROM admin_documents ad
  ORDER BY ad.created_at DESC;
END;
$$;

-- Function to create a new admin document
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
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_id uuid;
  new_doc admin_documents%ROWTYPE;
BEGIN
  -- Validate required parameters
  IF p_title IS NULL OR trim(p_title) = '' THEN
    RAISE EXCEPTION 'Document title is required';
  END IF;

  -- Validate category
  IF p_category NOT IN ('Financial', 'Legal', 'Reports', 'Other') THEN
    RAISE EXCEPTION 'Invalid category. Must be one of: Financial, Legal, Reports, Other';
  END IF;

  -- Validate status
  IF p_status NOT IN ('Active', 'Inactive') THEN
    RAISE EXCEPTION 'Invalid status. Must be Active or Inactive';
  END IF;

  -- Validate visibility
  IF p_visibility NOT IN ('all', 'accredited', 'institutional') THEN
    RAISE EXCEPTION 'Invalid visibility. Must be one of: all, accredited, institutional';
  END IF;

  -- Generate new ID
  new_id := gen_random_uuid();

  -- Insert the new document
  INSERT INTO admin_documents (
    id,
    title,
    description,
    category,
    file_path,
    file_size,
    file_type,
    status,
    visibility,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    new_id,
    trim(p_title),
    COALESCE(trim(p_description), ''),
    p_category,
    COALESCE(trim(p_file_path), ''),
    COALESCE(p_file_size, 0),
    COALESCE(trim(p_file_type), 'application/octet-stream'),
    p_status,
    p_visibility,
    COALESCE(trim(p_created_by), 'admin'),
    now(),
    now()
  ) RETURNING * INTO new_doc;

  -- Return the created document
  RETURN QUERY
  SELECT 
    new_doc.id,
    new_doc.title,
    new_doc.description,
    new_doc.category,
    new_doc.file_path,
    new_doc.file_size,
    new_doc.file_type,
    new_doc.status,
    new_doc.visibility,
    new_doc.created_at,
    new_doc.updated_at,
    new_doc.created_by;
END;
$$;

-- Function to update an existing admin document
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
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  updated_doc admin_documents%ROWTYPE;
BEGIN
  -- Validate required parameters
  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Document ID is required';
  END IF;

  IF p_title IS NULL OR trim(p_title) = '' THEN
    RAISE EXCEPTION 'Document title is required';
  END IF;

  -- Validate category
  IF p_category NOT IN ('Financial', 'Legal', 'Reports', 'Other') THEN
    RAISE EXCEPTION 'Invalid category. Must be one of: Financial, Legal, Reports, Other';
  END IF;

  -- Validate status
  IF p_status NOT IN ('Active', 'Inactive') THEN
    RAISE EXCEPTION 'Invalid status. Must be Active or Inactive';
  END IF;

  -- Validate visibility
  IF p_visibility NOT IN ('all', 'accredited', 'institutional') THEN
    RAISE EXCEPTION 'Invalid visibility. Must be one of: all, accredited, institutional';
  END IF;

  -- Check if document exists
  IF NOT EXISTS (SELECT 1 FROM admin_documents WHERE id = p_id) THEN
    RAISE EXCEPTION 'Document with ID % not found', p_id;
  END IF;

  -- Update the document
  UPDATE admin_documents 
  SET 
    title = trim(p_title),
    description = COALESCE(trim(p_description), ''),
    category = p_category,
    file_path = COALESCE(trim(p_file_path), file_path), -- Keep existing if not provided
    file_size = COALESCE(p_file_size, file_size), -- Keep existing if not provided
    file_type = COALESCE(trim(p_file_type), file_type), -- Keep existing if not provided
    status = p_status,
    visibility = p_visibility,
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO updated_doc;

  -- Return the updated document
  RETURN QUERY
  SELECT 
    updated_doc.id,
    updated_doc.title,
    updated_doc.description,
    updated_doc.category,
    updated_doc.file_path,
    updated_doc.file_size,
    updated_doc.file_type,
    updated_doc.status,
    updated_doc.visibility,
    updated_doc.created_at,
    updated_doc.updated_at,
    updated_doc.created_by;
END;
$$;

-- Function to delete an admin document
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
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_doc admin_documents%ROWTYPE;
BEGIN
  -- Validate required parameters
  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Document ID is required';
  END IF;

  -- Check if document exists and get its data before deletion
  SELECT * INTO deleted_doc FROM admin_documents WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document with ID % not found', p_id;
  END IF;

  -- Delete the document
  DELETE FROM admin_documents WHERE id = p_id;

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

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_admin_documents() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_admin_document(text, text, text, text, integer, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_admin_document(uuid, text, text, text, text, integer, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_admin_document(uuid) TO authenticated, service_role;