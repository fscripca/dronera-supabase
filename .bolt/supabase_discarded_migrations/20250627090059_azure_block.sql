/*
  # User Management Tables for Admin Dashboard

  1. New Tables
    - Enhanced profiles table with admin fields
    - User activity logs
    - User notes and risk assessments

  2. Security
    - RLS policies for admin access
    - Audit logging for all user management actions

  3. Functions
    - User creation with profile setup
    - User status updates
    - Bulk operations support
*/

-- Add additional columns to profiles table for admin management
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'banned')),
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'not_started' CHECK (kyc_status IN ('pending', 'approved', 'declined', 'not_started')),
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS wallet_address text,
ADD COLUMN IF NOT EXISTS token_balance integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS investment_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS last_activity timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS registration_ip text,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Create user activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create user notes table for detailed admin tracking
CREATE TABLE IF NOT EXISTS user_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id text NOT NULL,
  note_type text DEFAULT 'general' CHECK (note_type IN ('general', 'kyc', 'compliance', 'risk', 'support')),
  title text,
  content text NOT NULL,
  is_internal boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_notes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity);
CREATE INDEX IF NOT EXISTS idx_profiles_investment_amount ON profiles(investment_amount);
CREATE INDEX IF NOT EXISTS idx_profiles_risk_score ON profiles(risk_score);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_user_admin_notes_user_id ON user_admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_notes_admin_id ON user_admin_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_notes_type ON user_admin_notes(note_type);

-- RLS Policies for user_activity_logs
CREATE POLICY "Service role can manage activity logs"
  ON user_activity_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_admin_notes
CREATE POLICY "Service role can manage admin notes"
  ON user_admin_notes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read admin notes"
  ON user_admin_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create admin notes"
  ON user_admin_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update trigger for user_admin_notes
CREATE OR REPLACE FUNCTION update_user_admin_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_admin_notes_updated_at ON user_admin_notes;
CREATE TRIGGER update_user_admin_notes_updated_at
  BEFORE UPDATE ON user_admin_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_admin_notes_updated_at();

-- Function to create a new user with profile
CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_email text,
  p_password text,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_status text DEFAULT 'active',
  p_admin_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  profile_id uuid;
BEGIN
  -- Create auth user (this would typically be done via Supabase Auth API)
  -- For now, we'll just create the profile
  
  -- Generate a UUID for the user
  user_id := gen_random_uuid();
  
  -- Insert into profiles table
  INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    country,
    phone,
    status,
    admin_notes,
    email_verified,
    created_at,
    updated_at,
    last_activity
  ) VALUES (
    user_id,
    p_email,
    p_first_name,
    p_last_name,
    p_country,
    p_phone,
    p_status,
    p_admin_notes,
    false,
    now(),
    now(),
    now()
  ) RETURNING id INTO profile_id;
  
  -- Log the user creation
  INSERT INTO user_activity_logs (
    user_id,
    action,
    description,
    metadata
  ) VALUES (
    user_id,
    'USER_CREATED',
    'User account created by admin',
    jsonb_build_object(
      'created_by', 'admin',
      'initial_status', p_status
    )
  );
  
  RETURN user_id;
END;
$$;

-- Function to update user status
CREATE OR REPLACE FUNCTION update_user_status(
  p_user_id uuid,
  p_status text,
  p_admin_id text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_status text;
BEGIN
  -- Get current status
  SELECT status INTO old_status FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update status
  UPDATE profiles 
  SET 
    status = p_status,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the status change
  INSERT INTO user_activity_logs (
    user_id,
    action,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'STATUS_CHANGED',
    COALESCE(p_reason, 'Status changed by admin'),
    jsonb_build_object(
      'old_status', old_status,
      'new_status', p_status,
      'changed_by', p_admin_id,
      'reason', p_reason
    )
  );
  
  RETURN true;
END;
$$;

-- Function to update user risk score
CREATE OR REPLACE FUNCTION update_user_risk_score(
  p_user_id uuid,
  p_risk_score integer,
  p_admin_id text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_score integer;
BEGIN
  -- Validate risk score
  IF p_risk_score < 0 OR p_risk_score > 100 THEN
    RAISE EXCEPTION 'Risk score must be between 0 and 100';
  END IF;
  
  -- Get current risk score
  SELECT risk_score INTO old_score FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update risk score
  UPDATE profiles 
  SET 
    risk_score = p_risk_score,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the risk score change
  INSERT INTO user_activity_logs (
    user_id,
    action,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'RISK_SCORE_UPDATED',
    COALESCE(p_reason, 'Risk score updated by admin'),
    jsonb_build_object(
      'old_score', old_score,
      'new_score', p_risk_score,
      'updated_by', p_admin_id,
      'reason', p_reason
    )
  );
  
  RETURN true;
END;
$$;

-- Function to add admin note
CREATE OR REPLACE FUNCTION add_user_admin_note(
  p_user_id uuid,
  p_admin_id text,
  p_note_type text,
  p_title text,
  p_content text,
  p_is_internal boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  note_id uuid;
BEGIN
  -- Insert admin note
  INSERT INTO user_admin_notes (
    user_id,
    admin_id,
    note_type,
    title,
    content,
    is_internal
  ) VALUES (
    p_user_id,
    p_admin_id,
    p_note_type,
    p_title,
    p_content,
    p_is_internal
  ) RETURNING id INTO note_id;
  
  -- Log the note addition
  INSERT INTO user_activity_logs (
    user_id,
    action,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'ADMIN_NOTE_ADDED',
    'Admin note added: ' || p_title,
    jsonb_build_object(
      'note_type', p_note_type,
      'added_by', p_admin_id,
      'is_internal', p_is_internal
    )
  );
  
  RETURN note_id;
END;
$$;

-- Function to get user statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'active_users', COUNT(*) FILTER (WHERE status = 'active'),
    'suspended_users', COUNT(*) FILTER (WHERE status = 'suspended'),
    'pending_users', COUNT(*) FILTER (WHERE status = 'pending'),
    'banned_users', COUNT(*) FILTER (WHERE status = 'banned'),
    'kyc_approved', COUNT(*) FILTER (WHERE kyc_status = 'approved'),
    'kyc_pending', COUNT(*) FILTER (WHERE kyc_status = 'pending'),
    'kyc_declined', COUNT(*) FILTER (WHERE kyc_status = 'declined'),
    'kyc_not_started', COUNT(*) FILTER (WHERE kyc_status = 'not_started'),
    'total_investment', COALESCE(SUM(investment_amount), 0),
    'total_tokens', COALESCE(SUM(token_balance), 0),
    'avg_risk_score', COALESCE(AVG(risk_score), 0),
    'new_users_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'new_users_week', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_month', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
  )
  FROM profiles
  INTO result;
  
  RETURN result;
END;
$$;

-- Function to perform bulk user operations
CREATE OR REPLACE FUNCTION bulk_update_user_status(
  p_user_ids uuid[],
  p_status text,
  p_admin_id text,
  p_reason text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer := 0;
  user_id uuid;
BEGIN
  -- Validate status
  IF p_status NOT IN ('active', 'suspended', 'pending', 'banned') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;
  
  -- Update each user
  FOREACH user_id IN ARRAY p_user_ids
  LOOP
    BEGIN
      PERFORM update_user_status(user_id, p_status, p_admin_id, p_reason);
      updated_count := updated_count + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with other users
      RAISE WARNING 'Failed to update user %: %', user_id, SQLERRM;
    END;
  END LOOP;
  
  RETURN updated_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_risk_score TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_admin_note TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_user_status TO authenticated;