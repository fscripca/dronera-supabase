/*
  # Create Whitelist Management Tables

  1. New Tables
    - `whitelist_entries`
      - `id` (uuid, primary key)
      - `email_or_domain` (text, unique)
      - `type` (text, enum: email/domain)
      - `status` (text, enum: active/inactive/pending)
      - `category` (text, enum: core/investor/partner/temporary)
      - `date_added` (timestamp)
      - `added_by` (text, admin email)
      - `last_modified` (timestamp)
      - `modified_by` (text, admin email)
      - `notes` (text, optional)
      - `expires_at` (timestamp, optional)
      - `usage_count` (integer, default 0)

    - `whitelist_usage_logs`
      - `id` (uuid, primary key)
      - `whitelist_entry_id` (uuid, foreign key)
      - `user_email` (text)
      - `action` (text, e.g., 'registration', 'login')
      - `ip_address` (text)
      - `user_agent` (text)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access only
    - Create indexes for performance

  3. Functions
    - Function to check if email/domain is whitelisted
    - Function to log whitelist usage
    - Function to get whitelist statistics
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE whitelist_type AS ENUM ('email', 'domain');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE whitelist_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE whitelist_category AS ENUM ('core', 'investor', 'partner', 'temporary');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create whitelist_entries table
CREATE TABLE IF NOT EXISTS whitelist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_or_domain text UNIQUE NOT NULL,
  type whitelist_type NOT NULL,
  status whitelist_status DEFAULT 'active',
  category whitelist_category DEFAULT 'investor',
  date_added timestamptz DEFAULT now(),
  added_by text NOT NULL,
  last_modified timestamptz,
  modified_by text,
  notes text,
  expires_at timestamptz,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create whitelist_usage_logs table
CREATE TABLE IF NOT EXISTS whitelist_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whitelist_entry_id uuid REFERENCES whitelist_entries(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE whitelist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelist_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whitelist_entries_email_domain ON whitelist_entries(email_or_domain);
CREATE INDEX IF NOT EXISTS idx_whitelist_entries_type ON whitelist_entries(type);
CREATE INDEX IF NOT EXISTS idx_whitelist_entries_status ON whitelist_entries(status);
CREATE INDEX IF NOT EXISTS idx_whitelist_entries_category ON whitelist_entries(category);
CREATE INDEX IF NOT EXISTS idx_whitelist_entries_date_added ON whitelist_entries(date_added);
CREATE INDEX IF NOT EXISTS idx_whitelist_entries_expires_at ON whitelist_entries(expires_at);

CREATE INDEX IF NOT EXISTS idx_whitelist_usage_logs_entry_id ON whitelist_usage_logs(whitelist_entry_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_usage_logs_user_email ON whitelist_usage_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_whitelist_usage_logs_action ON whitelist_usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_whitelist_usage_logs_timestamp ON whitelist_usage_logs(timestamp);

-- Create updated_at trigger for whitelist_entries
DROP TRIGGER IF EXISTS update_whitelist_entries_updated_at ON whitelist_entries;
CREATE TRIGGER update_whitelist_entries_updated_at
  BEFORE UPDATE ON whitelist_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Whitelist entries - admin access only
CREATE POLICY "Service role can manage whitelist entries"
  ON whitelist_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read whitelist entries"
  ON whitelist_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage whitelist entries"
  ON whitelist_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Usage logs - admin access only
CREATE POLICY "Service role can manage usage logs"
  ON whitelist_usage_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read usage logs"
  ON whitelist_usage_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert usage logs"
  ON whitelist_usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to check if email/domain is whitelisted
CREATE OR REPLACE FUNCTION is_whitelisted(
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  domain_part text;
  is_allowed boolean := false;
BEGIN
  -- Extract domain from email
  domain_part := '@' || split_part(p_email, '@', 2);
  
  -- Check for exact email match (active and not expired)
  SELECT EXISTS(
    SELECT 1 FROM whitelist_entries 
    WHERE email_or_domain = p_email 
    AND type = 'email' 
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO is_allowed;
  
  -- If not found, check for domain match
  IF NOT is_allowed THEN
    SELECT EXISTS(
      SELECT 1 FROM whitelist_entries 
      WHERE email_or_domain = domain_part 
      AND type = 'domain' 
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    ) INTO is_allowed;
  END IF;
  
  RETURN is_allowed;
END;
$$;

-- Function to log whitelist usage
CREATE OR REPLACE FUNCTION log_whitelist_usage(
  p_email text,
  p_action text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  entry_id uuid;
  log_id uuid;
  domain_part text;
BEGIN
  -- Extract domain from email
  domain_part := '@' || split_part(p_email, '@', 2);
  
  -- Find the whitelist entry (email first, then domain)
  SELECT id INTO entry_id FROM whitelist_entries 
  WHERE email_or_domain = p_email AND type = 'email'
  LIMIT 1;
  
  IF entry_id IS NULL THEN
    SELECT id INTO entry_id FROM whitelist_entries 
    WHERE email_or_domain = domain_part AND type = 'domain'
    LIMIT 1;
  END IF;
  
  -- Log the usage
  INSERT INTO whitelist_usage_logs (
    whitelist_entry_id,
    user_email,
    action,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    entry_id,
    p_email,
    p_action,
    p_ip_address,
    p_user_agent,
    p_metadata
  ) RETURNING id INTO log_id;
  
  -- Update usage count if entry found
  IF entry_id IS NOT NULL THEN
    UPDATE whitelist_entries 
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE id = entry_id;
  END IF;
  
  RETURN log_id;
END;
$$;

-- Function to add whitelist entry
CREATE OR REPLACE FUNCTION add_whitelist_entry(
  p_email_or_domain text,
  p_type whitelist_type,
  p_category whitelist_category,
  p_added_by text,
  p_notes text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  entry_id uuid;
BEGIN
  -- Normalize domain format
  IF p_type = 'domain' AND NOT p_email_or_domain LIKE '@%' THEN
    p_email_or_domain := '@' || p_email_or_domain;
  END IF;
  
  -- Insert new entry
  INSERT INTO whitelist_entries (
    email_or_domain,
    type,
    category,
    added_by,
    notes,
    expires_at
  ) VALUES (
    p_email_or_domain,
    p_type,
    p_category,
    p_added_by,
    p_notes,
    p_expires_at
  ) RETURNING id INTO entry_id;
  
  RETURN entry_id;
END;
$$;

-- Function to update whitelist entry
CREATE OR REPLACE FUNCTION update_whitelist_entry(
  p_entry_id uuid,
  p_status whitelist_status,
  p_category whitelist_category,
  p_modified_by text,
  p_notes text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE whitelist_entries 
  SET 
    status = p_status,
    category = p_category,
    modified_by = p_modified_by,
    notes = p_notes,
    expires_at = p_expires_at,
    last_modified = now(),
    updated_at = now()
  WHERE id = p_entry_id;
  
  RETURN FOUND;
END;
$$;

-- Function to delete whitelist entry
CREATE OR REPLACE FUNCTION delete_whitelist_entry(
  p_entry_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM whitelist_entries WHERE id = p_entry_id;
  RETURN FOUND;
END;
$$;

-- Function to get whitelist statistics
CREATE OR REPLACE FUNCTION get_whitelist_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_entries', COUNT(*),
    'active_entries', COUNT(*) FILTER (WHERE status = 'active'),
    'inactive_entries', COUNT(*) FILTER (WHERE status = 'inactive'),
    'pending_entries', COUNT(*) FILTER (WHERE status = 'pending'),
    'email_entries', COUNT(*) FILTER (WHERE type = 'email'),
    'domain_entries', COUNT(*) FILTER (WHERE type = 'domain'),
    'core_entries', COUNT(*) FILTER (WHERE category = 'core'),
    'investor_entries', COUNT(*) FILTER (WHERE category = 'investor'),
    'partner_entries', COUNT(*) FILTER (WHERE category = 'partner'),
    'temporary_entries', COUNT(*) FILTER (WHERE category = 'temporary'),
    'expired_entries', COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < now()),
    'total_usage', COALESCE(SUM(usage_count), 0),
    'entries_added_today', COUNT(*) FILTER (WHERE date_added >= CURRENT_DATE),
    'entries_added_week', COUNT(*) FILTER (WHERE date_added >= CURRENT_DATE - INTERVAL '7 days'),
    'entries_added_month', COUNT(*) FILTER (WHERE date_added >= CURRENT_DATE - INTERVAL '30 days')
  )
  FROM whitelist_entries
  INTO result;
  
  RETURN result;
END;
$$;

-- Function to bulk update whitelist entries
CREATE OR REPLACE FUNCTION bulk_update_whitelist_status(
  p_entry_ids uuid[],
  p_status whitelist_status,
  p_modified_by text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer := 0;
BEGIN
  UPDATE whitelist_entries 
  SET 
    status = p_status,
    modified_by = p_modified_by,
    last_modified = now(),
    updated_at = now()
  WHERE id = ANY(p_entry_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Function to clean up expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_whitelist_entries()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Update expired entries to inactive status instead of deleting
  UPDATE whitelist_entries 
  SET 
    status = 'inactive',
    last_modified = now(),
    updated_at = now()
  WHERE expires_at IS NOT NULL 
    AND expires_at < now() 
    AND status = 'active';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_whitelisted TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_whitelist_usage TO authenticated, anon;
GRANT EXECUTE ON FUNCTION add_whitelist_entry TO authenticated;
GRANT EXECUTE ON FUNCTION update_whitelist_entry TO authenticated;
GRANT EXECUTE ON FUNCTION delete_whitelist_entry TO authenticated;
GRANT EXECUTE ON FUNCTION get_whitelist_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_whitelist_status TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_whitelist_entries TO authenticated;

-- Insert some initial whitelist entries for demo
INSERT INTO whitelist_entries (email_or_domain, type, category, added_by, notes) VALUES
  ('florin@dronera.eu', 'email', 'core', 'system', 'Co-founder and CFO'),
  ('@dronera.eu', 'domain', 'core', 'system', 'Company domain'),
  ('admin@dronera.eu', 'email', 'core', 'system', 'Admin account')
ON CONFLICT (email_or_domain) DO NOTHING;