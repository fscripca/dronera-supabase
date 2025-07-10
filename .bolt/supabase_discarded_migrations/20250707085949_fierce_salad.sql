-- Create enum types if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'declined');
  END IF;
END $$;

-- Create kyc_verifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  session_id text UNIQUE NOT NULL,
  status kyc_status DEFAULT 'pending',
  verification_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  verification_url text,
  callback_url text,
  didit_session_token text,
  didit_session_id text,
  risk_score integer,
  compliance_data jsonb DEFAULT '{}',
  extracted_data jsonb DEFAULT '{}',
  override_reason text,
  override_admin_id text,
  override_timestamp timestamptz
);

-- Create kyc_webhook_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS kyc_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  webhook_payload jsonb NOT NULL,
  status text DEFAULT 'received',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_session_id ON kyc_verifications(session_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_created_at ON kyc_verifications(created_at);
CREATE INDEX IF NOT EXISTS idx_kyc_didit_session_id ON kyc_verifications(didit_session_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verification_url ON kyc_verifications(verification_url);

CREATE INDEX IF NOT EXISTS idx_webhook_session_id ON kyc_webhook_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_webhook_created_at ON kyc_webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_status ON kyc_webhook_logs(status);

-- Enable RLS on tables
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_kyc_verifications_updated_at ON kyc_verifications;
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for kyc_verifications
CREATE POLICY "Users can read own KYC data"
  ON kyc_verifications
  FOR SELECT
  TO authenticated
  USING (((auth.uid())::text = user_id) OR ((auth.jwt() ->> 'email'::text) = email));

CREATE POLICY "Users can create own KYC data"
  ON kyc_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (((auth.uid())::text = user_id) OR ((auth.jwt() ->> 'email'::text) = email));

CREATE POLICY "Users can update own pending KYC data"
  ON kyc_verifications
  FOR UPDATE
  TO authenticated
  USING ((((auth.uid())::text = user_id) OR ((auth.jwt() ->> 'email'::text) = email)) AND (status = 'pending'::kyc_status))
  WITH CHECK ((((auth.uid())::text = user_id) OR ((auth.jwt() ->> 'email'::text) = email)) AND (status = 'pending'::kyc_status));

CREATE POLICY "Service role can read all KYC data"
  ON kyc_verifications
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update KYC data"
  ON kyc_verifications
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for kyc_webhook_logs
CREATE POLICY "Service role can manage webhook logs"
  ON kyc_webhook_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update KYC status
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

-- Function to get KYC by email
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

-- Function to handle Didit webhook
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

-- Function to log webhook calls
CREATE OR REPLACE FUNCTION log_kyc_webhook(
  p_session_id text,
  p_payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO kyc_webhook_logs (session_id, webhook_payload)
  VALUES (p_session_id, p_payload)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to update webhook log status
CREATE OR REPLACE FUNCTION update_webhook_log_status(
  p_log_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE kyc_webhook_logs 
  SET 
    status = p_status,
    processed_at = now()
  WHERE id = p_log_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_kyc_status TO service_role;
GRANT EXECUTE ON FUNCTION get_kyc_by_email TO service_role;
GRANT EXECUTE ON FUNCTION handle_didit_webhook TO service_role;
GRANT EXECUTE ON FUNCTION log_kyc_webhook TO service_role;
GRANT EXECUTE ON FUNCTION update_webhook_log_status TO service_role;