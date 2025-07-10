/*
  # Remove Didit API References

  1. Changes
    - Drop Didit-specific tables
    - Remove Didit-specific columns from kyc_verifications
    - Update functions to remove Didit dependencies
    - Maintain all other functionality

  2. Security
    - Maintain RLS policies for remaining tables
    - Ensure proper access control
*/

-- Drop Didit-specific tables
DROP TABLE IF EXISTS didit_biometrics;
DROP TABLE IF EXISTS didit_documents;
DROP TABLE IF EXISTS didit_sessions;
DROP TABLE IF EXISTS didit_api_logs;
DROP TABLE IF EXISTS kyc_webhook_logs;

-- Remove Didit-specific columns from kyc_verifications
ALTER TABLE kyc_verifications 
DROP COLUMN IF EXISTS didit_session_id,
DROP COLUMN IF EXISTS didit_session_token;

-- Update kyc_verifications table to use generic session management
ALTER TABLE kyc_verifications
ADD COLUMN IF NOT EXISTS external_provider text,
ADD COLUMN IF NOT EXISTS external_session_id text;

-- Create index on new columns
CREATE INDEX IF NOT EXISTS idx_kyc_external_provider ON kyc_verifications(external_provider);
CREATE INDEX IF NOT EXISTS idx_kyc_external_session_id ON kyc_verifications(external_session_id);

-- Update function to handle KYC status updates without Didit dependency
CREATE OR REPLACE FUNCTION update_kyc_status(
  p_session_id text,
  p_status kyc_status,
  p_verification_data jsonb DEFAULT '{}'
)
RETURNS kyc_verifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result kyc_verifications;
BEGIN
  UPDATE kyc_verifications 
  SET 
    status = p_status,
    verification_data = p_verification_data,
    updated_at = now()
  WHERE session_id = p_session_id
  RETURNING * INTO result;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'KYC session not found: %', p_session_id;
  END IF;
  
  RETURN result;
END;
$$;

-- Create generic webhook handler function
CREATE OR REPLACE FUNCTION handle_kyc_webhook(
  p_session_id text,
  p_status text,
  p_verification_data jsonb DEFAULT '{}'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  kyc_status_enum kyc_status;
  result kyc_verifications;
BEGIN
  -- Convert string status to enum
  CASE p_status
    WHEN 'approved' THEN kyc_status_enum := 'approved';
    WHEN 'declined' THEN kyc_status_enum := 'declined';
    WHEN 'pending' THEN kyc_status_enum := 'pending';
    ELSE RAISE EXCEPTION 'Invalid status: %', p_status;
  END CASE;
  
  -- Update the record
  SELECT * INTO result FROM update_kyc_status(p_session_id, kyc_status_enum, p_verification_data);
  
  -- Return success response
  RETURN json_build_object(
    'status', 'success',
    'message', 'KYC status updated successfully',
    'session_id', p_session_id,
    'new_status', p_status,
    'user_id', result.user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'status', 'error',
      'message', SQLERRM,
      'session_id', p_session_id
    );
END;
$$;

-- Create function to log KYC activity
CREATE OR REPLACE FUNCTION log_kyc_activity(
  p_session_id text,
  p_action text,
  p_description text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    'system',
    'KYC_' || p_action,
    p_description || ' (Session: ' || p_session_id || ')',
    'system',
    'system',
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_kyc_status TO service_role;
GRANT EXECUTE ON FUNCTION handle_kyc_webhook TO service_role;
GRANT EXECUTE ON FUNCTION log_kyc_activity TO service_role;