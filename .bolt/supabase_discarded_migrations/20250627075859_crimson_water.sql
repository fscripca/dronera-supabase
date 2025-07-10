/*
  # Create admin audit logs table

  1. New Tables
    - `admin_audit_logs`
      - `id` (uuid, primary key)
      - `admin_id` (text, admin identifier)
      - `action` (text, action performed)
      - `details` (text, action details)
      - `ip_address` (text, client IP address)
      - `user_agent` (text, client user agent)
      - `timestamp` (timestamptz, when action occurred)

  2. Security
    - Enable RLS on `admin_audit_logs` table
    - Add policy for service role to manage audit logs
    - Add policy for authenticated users to read audit logs (admin access)

  3. Indexes
    - Index on admin_id for efficient queries
    - Index on timestamp for time-based queries
    - Index on action for filtering by action type
*/

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text NOT NULL,
  action text NOT NULL,
  details text NOT NULL,
  ip_address text DEFAULT 'unknown',
  user_agent text DEFAULT 'unknown',
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON admin_audit_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs (action);

-- RLS Policies
CREATE POLICY "Service role can manage audit logs"
  ON admin_audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert audit logs"
  ON admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);