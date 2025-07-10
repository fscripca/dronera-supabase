/*
  # Create Admin Document Management Functions

  1. New Functions
    - `create_admin_document` - Creates a new admin document with SECURITY DEFINER privileges
    - `update_admin_document` - Updates an existing admin document with SECURITY DEFINER privileges  
    - `delete_admin_document` - Deletes an admin document with SECURITY DEFINER privileges
    - `get_admin_documents` - Retrieves all admin documents with SECURITY DEFINER privileges

  2. Security
    - All functions use SECURITY DEFINER to bypass RLS
    - Functions validate input parameters
    - Proper error handling and logging
*/

-- Function to create admin documents
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
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_record admin_documents%ROWTYPE;
  result_json json;
BEGIN
  -- Validate required parameters
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

  -- Insert the document
  INSERT INTO admin_documents (
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
    p_title,
    p_description,
    p_category,
    p_file_path,
    p_file_size,
    p_file_type,
    p_status,
    p_visibility,
    p_created_by,
    now(),
    now()
  ) RETURNING * INTO result_record;

  -- Convert to JSON
  SELECT row_to_json(result_record) INTO result_json;
  
  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create admin document: %', SQLERRM;
END;
$$;

-- Function to update admin documents
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
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_record admin_documents%ROWTYPE;
  result_json json;
BEGIN
  -- Validate required parameters
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
  WHERE id = p_id
  RETURNING * INTO result_record;

  -- Check if document was found and updated
  IF result_record.id IS NULL THEN
    RAISE EXCEPTION 'Document with ID % not found', p_id;
  END IF;

  -- Convert to JSON
  SELECT row_to_json(result_record) INTO result_json;
  
  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update admin document: %', SQLERRM;
END;
$$;

-- Function to delete admin documents
CREATE OR REPLACE FUNCTION delete_admin_document(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_record admin_documents%ROWTYPE;
  result_json json;
BEGIN
  -- Validate required parameters
  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Document ID is required';
  END IF;

  -- Delete the document and return the deleted record
  DELETE FROM admin_documents 
  WHERE id = p_id
  RETURNING * INTO result_record;

  -- Check if document was found and deleted
  IF result_record.id IS NULL THEN
    RAISE EXCEPTION 'Document with ID % not found', p_id;
  END IF;

  -- Convert to JSON
  SELECT row_to_json(result_record) INTO result_json;
  
  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to delete admin document: %', SQLERRM;
END;
$$;

-- Function to get all admin documents
CREATE OR REPLACE FUNCTION get_admin_documents()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_json json;
BEGIN
  -- Get all documents ordered by created_at desc
  SELECT json_agg(row_to_json(t)) INTO result_json
  FROM (
    SELECT * FROM admin_documents 
    ORDER BY created_at DESC
  ) t;
  
  -- Return empty array if no documents found
  IF result_json IS NULL THEN
    result_json := '[]'::json;
  END IF;
  
  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to get admin documents: %', SQLERRM;
END;
$$;

-- Grant execute permissions to authenticated and service roles
GRANT EXECUTE ON FUNCTION create_admin_document TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_admin_document TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_admin_document TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_admin_documents TO authenticated, service_role;