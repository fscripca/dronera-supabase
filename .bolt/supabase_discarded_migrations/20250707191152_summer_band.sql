/*
  # Add Update User Investment Function

  1. New Functions
    - `update_user_investment` - Updates a user's investment amount and token balance
    - Securely updates profile and token_holders tables
    - Handles transaction recording and audit logging

  2. Security
    - Function uses SECURITY DEFINER to bypass RLS
    - Proper parameter validation and error handling
    - Comprehensive audit logging
*/

-- Function to update user investment amount and token balance
CREATE OR REPLACE FUNCTION update_user_investment(
  p_user_id uuid,
  p_amount numeric,
  p_token_amount numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  wallet_address text;
  contract_id uuid;
BEGIN
  -- Validate parameters
  IF p_user_id IS NULL OR p_amount <= 0 OR p_token_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid parameters: user_id, amount, and token_amount must be provided and positive';
  END IF;

  -- Update profile investment amount
  UPDATE profiles
  SET 
    investment_amount = COALESCE(investment_amount, 0) + p_amount,
    updated_at = now()
  WHERE id = p_user_id;

  -- Get user's wallet address
  SELECT wallet_address INTO wallet_address
  FROM kyc_submissions
  WHERE user_id = p_user_id AND status = 'approved'
  ORDER BY submission_date DESC
  LIMIT 1;

  -- If no wallet address found, try to get from token_holders
  IF wallet_address IS NULL THEN
    SELECT th.wallet_address INTO wallet_address
    FROM token_holders th
    WHERE th.user_id = p_user_id
    LIMIT 1;
  END IF;

  -- If still no wallet address, generate a placeholder
  IF wallet_address IS NULL THEN
    wallet_address := 'placeholder_' || p_user_id::text;
  END IF;

  -- Get token contract ID
  SELECT id INTO contract_id
  FROM token_contracts
  WHERE is_active = true
  ORDER BY deployment_date DESC
  LIMIT 1;

  -- If no contract found, handle error
  IF contract_id IS NULL THEN
    RAISE EXCEPTION 'No active token contract found';
  END IF;

  -- Update or insert token holder record
  INSERT INTO token_holders (
    contract_id,
    wallet_address,
    user_id,
    balance,
    last_updated
  ) VALUES (
    contract_id,
    wallet_address,
    p_user_id,
    p_token_amount,
    now()
  )
  ON CONFLICT (contract_id, wallet_address)
  DO UPDATE SET
    balance = token_holders.balance + p_token_amount,
    last_updated = now();

  -- Log the investment in admin audit logs
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    timestamp
  ) VALUES (
    'system',
    'USER_INVESTMENT',
    'User ' || p_user_id || ' invested ' || p_amount || ' EUR for ' || p_token_amount || ' DRONE tokens',
    now()
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update user investment: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_investment TO service_role;