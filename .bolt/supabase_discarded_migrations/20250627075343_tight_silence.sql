/*
  # Didit API Integration Tables

  1. New Tables
    - `didit_api_logs` - API call logging and monitoring
    - `didit_sessions` - Enhanced session management
    - `didit_documents` - Document verification tracking
    - `didit_biometrics` - Biometric verification results

  2. Enhanced Tables
    - Update `kyc_verifications` with Didit-specific fields
    - Add performance monitoring columns

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for admin access
    - Implement audit logging

  4. Indexes
    - Performance indexes for API monitoring
    - Session lookup optimization
*/

-- Create Didit API logs table
CREATE TABLE IF NOT EXISTS didit_api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  session_id text,
  response_time_ms integer,
  status_code integer,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- Create Didit sessions table
CREATE TABLE IF NOT EXISTS didit_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id text NOT NULL,
  email text NOT NULL,
  verification_url text,
  status text DEFAULT 'pending',
  expires_at timestamptz,
  webhook_url text,
  redirect_url text,
  verification_type text DEFAULT 'full_kyc',
  required_documents text[] DEFAULT ARRAY['identity_document', 'proof_of_address', 'selfie'],
  biometric_requirements jsonb DEFAULT '{}',
  compliance_checks jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Didit documents table
CREATE TABLE IF NOT EXISTS didit_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES didit_sessions(session_id),
  document_id text NOT NULL,
  document_type text NOT NULL,
  filename text NOT NULL,
  file_size integer,
  mime_type text,
  status text DEFAULT 'pending',
  confidence_score integer,
  verification_data jsonb DEFAULT '{}',
  fraud_checks jsonb DEFAULT '{}',
  extracted_data jsonb DEFAULT '{}',
  uploaded_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- Create Didit biometrics table
CREATE TABLE IF NOT EXISTS didit_biometrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES didit_sessions(session_id),
  face_match_confidence integer,
  face_match_verified boolean DEFAULT false,
  liveness_score integer,
  liveness_passed boolean DEFAULT false,
  voice_match_confidence integer,
  voice_match_verified boolean DEFAULT false,
  biometric_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add Didit-specific columns to existing kyc_verifications table
ALTER TABLE kyc_verifications 
ADD COLUMN IF NOT EXISTS didit_session_id text,
ADD COLUMN IF NOT EXISTS risk_score integer,
ADD COLUMN IF NOT EXISTS compliance_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS extracted_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS override_reason text,
ADD COLUMN IF NOT EXISTS override_admin_id text,
ADD COLUMN IF NOT EXISTS override_timestamp timestamptz;

-- Enable RLS on new tables
ALTER TABLE didit_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE didit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE didit_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE didit_biometrics ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_didit_api_logs_timestamp ON didit_api_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_didit_api_logs_action ON didit_api_logs(action);
CREATE INDEX IF NOT EXISTS idx_didit_api_logs_session_id ON didit_api_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_didit_sessions_session_id ON didit_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_didit_sessions_user_id ON didit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_didit_sessions_email ON didit_sessions(email);
CREATE INDEX IF NOT EXISTS idx_didit_sessions_status ON didit_sessions(status);

CREATE INDEX IF NOT EXISTS idx_didit_documents_session_id ON didit_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_didit_documents_type ON didit_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_didit_documents_status ON didit_documents(status);

CREATE INDEX IF NOT EXISTS idx_didit_biometrics_session_id ON didit_biometrics(session_id);

CREATE INDEX IF NOT EXISTS idx_kyc_didit_session_id ON kyc_verifications(didit_session_id);

-- RLS Policies

-- API logs - service role only
CREATE POLICY "Service role can manage API logs"
  ON didit_api_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Sessions - service role and authenticated users can read their own
CREATE POLICY "Service role can manage all sessions"
  ON didit_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own sessions"
  ON didit_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = user_id OR 
    auth.jwt() ->> 'email' = email
  );

-- Documents - service role and session owners
CREATE POLICY "Service role can manage all documents"
  ON didit_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own session documents"
  ON didit_documents
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM didit_sessions 
      WHERE user_id = auth.uid()::text OR email = auth.jwt() ->> 'email'
    )
  );

-- Biometrics - service role and session owners
CREATE POLICY "Service role can manage all biometrics"
  ON didit_biometrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own session biometrics"
  ON didit_biometrics
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM didit_sessions 
      WHERE user_id = auth.uid()::text OR email = auth.jwt() ->> 'email'
    )
  );

-- Create updated_at trigger for didit_sessions
DROP TRIGGER IF EXISTS update_didit_sessions_updated_at ON didit_sessions;
CREATE TRIGGER update_didit_sessions_updated_at
  BEFORE UPDATE ON didit_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Functions for Didit integration

-- Function to log API calls
CREATE OR REPLACE FUNCTION log_didit_api_call(
  p_action text,
  p_description text,
  p_metadata jsonb DEFAULT '{}',
  p_session_id text DEFAULT NULL,
  p_response_time_ms integer DEFAULT NULL,
  p_status_code integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO didit_api_logs (
    action,
    description,
    metadata,
    session_id,
    response_time_ms,
    status_code
  )
  VALUES (
    p_action,
    p_description,
    p_metadata,
    p_session_id,
    p_response_time_ms,
    p_status_code
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to create Didit session
CREATE OR REPLACE FUNCTION create_didit_session(
  p_session_id text,
  p_user_id text,
  p_email text,
  p_verification_url text,
  p_settings jsonb DEFAULT '{}'
)
RETURNS didit_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result didit_sessions;
BEGIN
  INSERT INTO didit_sessions (
    session_id,
    user_id,
    email,
    verification_url,
    settings,
    expires_at
  )
  VALUES (
    p_session_id,
    p_user_id,
    p_email,
    p_verification_url,
    p_settings,
    now() + interval '1 hour'
  )
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Function to update session status
CREATE OR REPLACE FUNCTION update_didit_session_status(
  p_session_id text,
  p_status text,
  p_verification_data jsonb DEFAULT '{}'
)
RETURNS didit_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result didit_sessions;
BEGIN
  UPDATE didit_sessions 
  SET 
    status = p_status,
    updated_at = now()
  WHERE session_id = p_session_id
  RETURNING * INTO result;
  
  -- Also update the main KYC table
  UPDATE kyc_verifications
  SET
    status = CASE 
      WHEN p_status = 'completed' THEN 'approved'::kyc_status
      WHEN p_status = 'failed' THEN 'declined'::kyc_status
      ELSE 'pending'::kyc_status
    END,
    verification_data = p_verification_data,
    updated_at = now()
  WHERE didit_session_id = p_session_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Didit session not found: %', p_session_id;
  END IF;
  
  RETURN result;
END;
$$;

-- Function to get performance metrics
CREATE OR REPLACE FUNCTION get_didit_performance_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_api_calls', COUNT(*),
    'avg_response_time', AVG(response_time_ms),
    'success_rate', 
      ROUND(
        (COUNT(*) FILTER (WHERE status_code BETWEEN 200 AND 299)::numeric / COUNT(*)) * 100, 
        2
      ),
    'calls_by_action', jsonb_object_agg(action, action_count),
    'last_24h_calls', COUNT(*) FILTER (WHERE timestamp > now() - interval '24 hours')
  )
  FROM didit_api_logs
  LEFT JOIN (
    SELECT action, COUNT(*) as action_count
    FROM didit_api_logs
    WHERE timestamp > now() - interval '7 days'
    GROUP BY action
  ) action_stats ON true
  INTO result;
  
  RETURN result;
END;
$$;