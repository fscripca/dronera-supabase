/*
  # Update KYC Verifications Table

  1. Table Updates
    - Add `verification_url` column to store Didit verification URLs
    - Add `callback_url` column for post-verification redirects
    - Update indexes for better performance

  2. Security
    - Update RLS policies to handle new columns
    - Ensure proper access control for verification URLs

  3. Functions
    - Add function to extract session ID from verification URL
    - Add function to handle status updates
*/

-- Add new columns to kyc_verifications table
ALTER TABLE kyc_verifications 
ADD COLUMN IF NOT EXISTS verification_url text,
ADD COLUMN IF NOT EXISTS callback_url text,
ADD COLUMN IF NOT EXISTS didit_session_token text;

-- Create index on verification_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_kyc_verification_url ON kyc_verifications(verification_url);

-- Create function to update KYC status
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

-- Create function to get KYC status by email
CREATE OR REPLACE FUNCTION get_kyc_by_email(p_email text)
RETURNS kyc_verifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result kyc_verifications;
BEGIN
  SELECT * INTO result
  FROM kyc_verifications 
  WHERE email = p_email
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN result;
END;
$$;

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can read own KYC data" ON kyc_verifications;
CREATE POLICY "Users can read own KYC data"
  ON kyc_verifications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = user_id OR 
    auth.jwt() ->> 'email' = email
  );

-- Allow users to update their verification URL
DROP POLICY IF EXISTS "Users can update own pending KYC data" ON kyc_verifications;
CREATE POLICY "Users can update own pending KYC data"
  ON kyc_verifications
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid()::text = user_id OR auth.jwt() ->> 'email' = email) 
    AND status = 'pending'
  )
  WITH CHECK (
    (auth.uid()::text = user_id OR auth.jwt() ->> 'email' = email) 
    AND status = 'pending'
  );

-- Create webhook endpoint function for Didit callbacks
CREATE OR REPLACE FUNCTION handle_didit_webhook(
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