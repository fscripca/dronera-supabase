/*
  # Create Admin Audit Log Function

  1. New Functions
    - `log_admin_audit_action` - Securely logs admin actions bypassing RLS
      - Parameters: admin_id (text), action (text), details (text), ip_address (text), user_agent (text)
      - Uses SECURITY DEFINER to bypass RLS policies
      - Automatically sets timestamp using NOW()

  2. Security
    - Function runs with definer's privileges to bypass RLS
    - Only accessible to authenticated users
    - Maintains audit trail integrity
*/

-- Create function to log admin audit actions
CREATE OR REPLACE FUNCTION log_admin_audit_action(
  p_admin_id text,
  p_action text,
  p_details text,
  p_ip_address text DEFAULT 'unknown',
  p_user_agent text DEFAULT 'unknown'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    p_admin_id,
    p_action,
    p_details,
    p_ip_address,
    p_user_agent,
    NOW()
  )
  RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_admin_audit_action TO authenticated;