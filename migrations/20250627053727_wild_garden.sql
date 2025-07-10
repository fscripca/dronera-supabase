/*
  # Create KYC Webhook Logs Table

  1. New Tables
    - `kyc_webhook_logs`
      - `id` (uuid, primary key)
      - `session_id` (text, references kyc_verifications)
      - `webhook_payload` (jsonb, full webhook data)
      - `status` (text, processing status)
      - `processed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `kyc_webhook_logs` table
    - Add policy for service role to manage webhook logs

  3. Indexes
    - Index on session_id for fast lookups
    - Index on created_at for chronological queries
*/

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS kyc_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  webhook_payload jsonb NOT NULL,
  status text DEFAULT 'received',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE kyc_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_session_id ON kyc_webhook_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_webhook_created_at ON kyc_webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_status ON kyc_webhook_logs(status);

-- RLS Policies - Only service role can access webhook logs
CREATE POLICY "Service role can manage webhook logs"
  ON kyc_webhook_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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