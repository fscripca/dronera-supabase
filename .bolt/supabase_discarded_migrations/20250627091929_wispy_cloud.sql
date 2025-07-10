/*
  # Token Management System

  1. New Tables
    - `token_configurations` - Stores token parameters and settings
    - `token_transactions` - Records all token-related transactions
    - `token_holders` - Tracks token balances and holder information
    - `token_distributions` - Manages profit distribution events
    - `token_compliance_checks` - Logs compliance verification activities

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Secure functions for token operations

  3. Functions
    - Token minting and burning
    - Distribution scheduling and execution
    - Compliance verification
    - Reporting and analytics
*/

-- Create token_configurations table
CREATE TABLE IF NOT EXISTS token_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'DRONE Token',
  symbol text NOT NULL DEFAULT 'DRONE',
  decimals integer NOT NULL DEFAULT 18,
  contract_address text,
  network text DEFAULT 'Base',
  max_supply bigint NOT NULL DEFAULT 100000000,
  minting_enabled boolean DEFAULT true,
  burning_enabled boolean DEFAULT true,
  transfers_enabled boolean DEFAULT true,
  distribution_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_modified_by text,
  version integer DEFAULT 1
);

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_hash text,
  type text NOT NULL CHECK (type IN ('mint', 'burn', 'transfer', 'distribution', 'vesting')),
  from_address text,
  to_address text,
  amount numeric NOT NULL,
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  gas_used bigint,
  block_number bigint,
  metadata jsonb DEFAULT '{}',
  initiated_by text,
  reason text
);

-- Create token_holders table
CREATE TABLE IF NOT EXISTS token_holders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text UNIQUE NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  percentage numeric,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  first_transaction_date timestamptz,
  last_activity timestamptz DEFAULT now(),
  kyc_status text DEFAULT 'unverified' CHECK (kyc_status IN ('verified', 'pending', 'unverified')),
  investment_tier text DEFAULT 'retail' CHECK (investment_tier IN ('retail', 'accredited', 'institutional')),
  lockup_expiry timestamptz,
  vesting_schedule jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create token_distributions table
CREATE TABLE IF NOT EXISTS token_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  profit_period text NOT NULL,
  distribution_date timestamptz NOT NULL,
  eligible_holders integer,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'failed')),
  transaction_hash text,
  snapshot_block_number bigint,
  distribution_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

-- Create token_compliance_checks table
CREATE TABLE IF NOT EXISTS token_compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('aml', 'sanctions', 'kyc', 'accreditation')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('passed', 'failed', 'pending')),
  last_check_date timestamptz DEFAULT now(),
  next_check_date timestamptz,
  details text,
  results jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  performed_by text
);

-- Enable RLS on all tables
ALTER TABLE token_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_compliance_checks ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_token_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_token_configurations_updated_at ON token_configurations;
CREATE TRIGGER update_token_configurations_updated_at
  BEFORE UPDATE ON token_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_token_configurations_updated_at();

DROP TRIGGER IF EXISTS update_token_holders_updated_at ON token_holders;
CREATE TRIGGER update_token_holders_updated_at
  BEFORE UPDATE ON token_holders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_token_distributions_updated_at ON token_distributions;
CREATE TRIGGER update_token_distributions_updated_at
  BEFORE UPDATE ON token_distributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_token_compliance_checks_updated_at ON token_compliance_checks;
CREATE TRIGGER update_token_compliance_checks_updated_at
  BEFORE UPDATE ON token_compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_timestamp ON token_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_token_transactions_status ON token_transactions(status);
CREATE INDEX IF NOT EXISTS idx_token_transactions_from_address ON token_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to_address ON token_transactions(to_address);

CREATE INDEX IF NOT EXISTS idx_token_holders_address ON token_holders(address);
CREATE INDEX IF NOT EXISTS idx_token_holders_balance ON token_holders(balance);
CREATE INDEX IF NOT EXISTS idx_token_holders_kyc_status ON token_holders(kyc_status);
CREATE INDEX IF NOT EXISTS idx_token_holders_investment_tier ON token_holders(investment_tier);

CREATE INDEX IF NOT EXISTS idx_token_distributions_status ON token_distributions(status);
CREATE INDEX IF NOT EXISTS idx_token_distributions_distribution_date ON token_distributions(distribution_date);

CREATE INDEX IF NOT EXISTS idx_token_compliance_checks_type ON token_compliance_checks(type);
CREATE INDEX IF NOT EXISTS idx_token_compliance_checks_status ON token_compliance_checks(status);
CREATE INDEX IF NOT EXISTS idx_token_compliance_checks_next_check_date ON token_compliance_checks(next_check_date);

-- RLS Policies

-- Token configurations - admin access only
CREATE POLICY "Service role can manage token configurations"
  ON token_configurations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read token configurations"
  ON token_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- Token transactions - admin access for write, authenticated for read
CREATE POLICY "Service role can manage token transactions"
  ON token_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read token transactions"
  ON token_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Token holders - admin access for write, authenticated for read
CREATE POLICY "Service role can manage token holders"
  ON token_holders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read token holders"
  ON token_holders
  FOR SELECT
  TO authenticated
  USING (true);

-- Token distributions - admin access only
CREATE POLICY "Service role can manage token distributions"
  ON token_distributions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read token distributions"
  ON token_distributions
  FOR SELECT
  TO authenticated
  USING (true);

-- Token compliance checks - admin access only
CREATE POLICY "Service role can manage token compliance checks"
  ON token_compliance_checks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read token compliance checks"
  ON token_compliance_checks
  FOR SELECT
  TO authenticated
  USING (true);

-- Functions for token management

-- Function to mint tokens
CREATE OR REPLACE FUNCTION mint_tokens(
  p_to_address text,
  p_amount numeric,
  p_reason text,
  p_initiated_by text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tx_id uuid;
  holder_id uuid;
  current_balance numeric;
  total_supply numeric;
BEGIN
  -- Check if minting is enabled
  IF NOT EXISTS (SELECT 1 FROM token_configurations WHERE minting_enabled = true LIMIT 1) THEN
    RAISE EXCEPTION 'Token minting is currently disabled';
  END IF;
  
  -- Check if amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Mint amount must be greater than zero';
  END IF;
  
  -- Get current total supply
  SELECT COALESCE(SUM(balance), 0) INTO total_supply FROM token_holders;
  
  -- Check max supply limit
  IF (total_supply + p_amount) > (SELECT max_supply FROM token_configurations LIMIT 1) THEN
    RAISE EXCEPTION 'Mint would exceed maximum token supply';
  END IF;
  
  -- Create transaction record
  INSERT INTO token_transactions (
    type,
    to_address,
    amount,
    status,
    initiated_by,
    reason,
    metadata
  ) VALUES (
    'mint',
    p_to_address,
    p_amount,
    'pending',
    p_initiated_by,
    p_reason,
    jsonb_build_object(
      'previous_total_supply', total_supply,
      'new_total_supply', total_supply + p_amount
    )
  ) RETURNING id INTO tx_id;
  
  -- Update or create token holder record
  SELECT id, balance INTO holder_id, current_balance
  FROM token_holders
  WHERE address = p_to_address;
  
  IF FOUND THEN
    -- Update existing holder
    UPDATE token_holders
    SET 
      balance = current_balance + p_amount,
      last_activity = now(),
      updated_at = now()
    WHERE id = holder_id;
  ELSE
    -- Create new holder
    INSERT INTO token_holders (
      address,
      balance,
      first_transaction_date,
      last_activity
    ) VALUES (
      p_to_address,
      p_amount,
      now(),
      now()
    );
  END IF;
  
  -- Update all holder percentages
  UPDATE token_holders
  SET percentage = balance / (total_supply + p_amount);
  
  -- Log admin action
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    timestamp
  ) VALUES (
    p_initiated_by,
    'MINT_TOKENS',
    'Minted ' || p_amount || ' tokens to ' || p_to_address || '. Reason: ' || p_reason,
    now()
  );
  
  RETURN tx_id;
END;
$$;

-- Function to burn tokens
CREATE OR REPLACE FUNCTION burn_tokens(
  p_amount numeric,
  p_reason text,
  p_initiated_by text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tx_id uuid;
  total_supply numeric;
  treasury_address text;
  treasury_balance numeric;
BEGIN
  -- Check if burning is enabled
  IF NOT EXISTS (SELECT 1 FROM token_configurations WHERE burning_enabled = true LIMIT 1) THEN
    RAISE EXCEPTION 'Token burning is currently disabled';
  END IF;
  
  -- Check if amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Burn amount must be greater than zero';
  END IF;
  
  -- Get current total supply
  SELECT COALESCE(SUM(balance), 0) INTO total_supply FROM token_holders;
  
  -- Get treasury address (first holder with institutional tier)
  SELECT address, balance INTO treasury_address, treasury_balance
  FROM token_holders
  WHERE investment_tier = 'institutional'
  ORDER BY balance DESC
  LIMIT 1;
  
  -- Check if treasury has enough tokens
  IF treasury_balance < p_amount THEN
    RAISE EXCEPTION 'Treasury balance insufficient for burn';
  END IF;
  
  -- Create transaction record
  INSERT INTO token_transactions (
    type,
    from_address,
    amount,
    status,
    initiated_by,
    reason,
    metadata
  ) VALUES (
    'burn',
    treasury_address,
    p_amount,
    'pending',
    p_initiated_by,
    p_reason,
    jsonb_build_object(
      'previous_total_supply', total_supply,
      'new_total_supply', total_supply - p_amount
    )
  ) RETURNING id INTO tx_id;
  
  -- Update treasury balance
  UPDATE token_holders
  SET 
    balance = treasury_balance - p_amount,
    last_activity = now(),
    updated_at = now()
  WHERE address = treasury_address;
  
  -- Update all holder percentages
  UPDATE token_holders
  SET percentage = balance / (total_supply - p_amount)
  WHERE balance > 0;
  
  -- Log admin action
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    timestamp
  ) VALUES (
    p_initiated_by,
    'BURN_TOKENS',
    'Burned ' || p_amount || ' tokens from treasury. Reason: ' || p_reason,
    now()
  );
  
  RETURN tx_id;
END;
$$;

-- Function to schedule profit distribution
CREATE OR REPLACE FUNCTION schedule_profit_distribution(
  p_amount numeric,
  p_profit_period text,
  p_distribution_date timestamptz,
  p_created_by text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dist_id uuid;
  eligible_holders integer;
BEGIN
  -- Check if distribution is enabled
  IF NOT EXISTS (SELECT 1 FROM token_configurations WHERE distribution_enabled = true LIMIT 1) THEN
    RAISE EXCEPTION 'Profit distribution is currently disabled';
  END IF;
  
  -- Check if amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Distribution amount must be greater than zero';
  END IF;
  
  -- Check if distribution date is in the future
  IF p_distribution_date <= now() THEN
    RAISE EXCEPTION 'Distribution date must be in the future';
  END IF;
  
  -- Count eligible holders (KYC verified)
  SELECT COUNT(*) INTO eligible_holders
  FROM token_holders
  WHERE kyc_status = 'verified' AND balance > 0;
  
  -- Create distribution record
  INSERT INTO token_distributions (
    amount,
    profit_period,
    distribution_date,
    eligible_holders,
    status,
    created_by
  ) VALUES (
    p_amount,
    p_profit_period,
    p_distribution_date,
    eligible_holders,
    'scheduled',
    p_created_by
  ) RETURNING id INTO dist_id;
  
  -- Log admin action
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    timestamp
  ) VALUES (
    p_created_by,
    'SCHEDULE_DISTRIBUTION',
    'Scheduled ' || p_amount || ' EUR profit distribution for ' || p_profit_period || ' on ' || p_distribution_date,
    now()
  );
  
  RETURN dist_id;
END;
$$;

-- Function to update token configuration
CREATE OR REPLACE FUNCTION update_token_configuration(
  p_name text,
  p_symbol text,
  p_decimals integer,
  p_max_supply bigint,
  p_minting_enabled boolean,
  p_burning_enabled boolean,
  p_transfers_enabled boolean,
  p_distribution_enabled boolean,
  p_modified_by text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_config jsonb;
BEGIN
  -- Get current configuration
  SELECT to_jsonb(token_configurations.*) INTO old_config
  FROM token_configurations
  LIMIT 1;
  
  -- Update configuration
  UPDATE token_configurations
  SET
    name = p_name,
    symbol = p_symbol,
    decimals = p_decimals,
    max_supply = p_max_supply,
    minting_enabled = p_minting_enabled,
    burning_enabled = p_burning_enabled,
    transfers_enabled = p_transfers_enabled,
    distribution_enabled = p_distribution_enabled,
    last_modified_by = p_modified_by
  WHERE id = (SELECT id FROM token_configurations LIMIT 1);
  
  -- Log admin action
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    timestamp
  ) VALUES (
    p_modified_by,
    'UPDATE_TOKEN_CONFIG',
    'Updated token configuration',
    now()
  );
  
  RETURN true;
END;
$$;

-- Function to get token metrics
CREATE OR REPLACE FUNCTION get_token_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_supply numeric;
  circulating_supply numeric;
  locked_tokens numeric;
  burned_tokens numeric;
BEGIN
  -- Calculate token metrics
  SELECT COALESCE(SUM(balance), 0) INTO total_supply FROM token_holders;
  
  SELECT COALESCE(SUM(balance), 0) INTO locked_tokens
  FROM token_holders
  WHERE lockup_expiry > now();
  
  SELECT COALESCE(SUM(amount), 0) INTO burned_tokens
  FROM token_transactions
  WHERE type = 'burn' AND status = 'confirmed';
  
  circulating_supply := total_supply - locked_tokens;
  
  -- Build result object
  SELECT jsonb_build_object(
    'total_supply', total_supply,
    'circulating_supply', circulating_supply,
    'locked_tokens', locked_tokens,
    'burned_tokens', burned_tokens,
    'holders_count', (SELECT COUNT(*) FROM token_holders WHERE balance > 0),
    'verified_holders', (SELECT COUNT(*) FROM token_holders WHERE balance > 0 AND kyc_status = 'verified'),
    'transactions_24h', (SELECT COUNT(*) FROM token_transactions WHERE timestamp > now() - interval '24 hours'),
    'volume_24h', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM token_transactions 
      WHERE timestamp > now() - interval '24 hours' AND type = 'transfer'
    ),
    'distributed_profits', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM token_distributions 
      WHERE status = 'completed'
    ),
    'next_distribution', (
      SELECT jsonb_build_object(
        'date', distribution_date,
        'amount', amount,
        'profit_period', profit_period
      )
      FROM token_distributions
      WHERE status = 'scheduled'
      ORDER BY distribution_date
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to run compliance check
CREATE OR REPLACE FUNCTION run_compliance_check(
  p_type text,
  p_performed_by text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  check_id uuid;
  next_check_date timestamptz;
  check_status text := 'passed';
  check_details text := 'All checks passed successfully';
  check_results jsonb := '{}'::jsonb;
BEGIN
  -- Validate check type
  IF p_type NOT IN ('aml', 'sanctions', 'kyc', 'accreditation') THEN
    RAISE EXCEPTION 'Invalid compliance check type: %', p_type;
  END IF;
  
  -- Set next check date based on type
  CASE p_type
    WHEN 'aml' THEN next_check_date := now() + interval '30 days';
    WHEN 'sanctions' THEN next_check_date := now() + interval '30 days';
    WHEN 'kyc' THEN next_check_date := now() + interval '1 day';
    WHEN 'accreditation' THEN next_check_date := now() + interval '90 days';
  END CASE;
  
  -- For KYC check, determine status based on holders
  IF p_type = 'kyc' THEN
    IF EXISTS (
      SELECT 1 FROM token_holders 
      WHERE balance > 0 AND kyc_status != 'verified'
    ) THEN
      check_status := 'pending';
      check_details := (
        SELECT COUNT(*) || ' holders pending KYC verification'
        FROM token_holders
        WHERE balance > 0 AND kyc_status != 'verified'
      );
      
      check_results := (
        SELECT jsonb_agg(jsonb_build_object(
          'address', address,
          'balance', balance,
          'kyc_status', kyc_status
        ))
        FROM token_holders
        WHERE balance > 0 AND kyc_status != 'verified'
      );
    END IF;
  END IF;
  
  -- Create compliance check record
  INSERT INTO token_compliance_checks (
    type,
    status,
    last_check_date,
    next_check_date,
    details,
    results,
    performed_by
  ) VALUES (
    p_type,
    check_status,
    now(),
    next_check_date,
    check_details,
    check_results,
    p_performed_by
  ) RETURNING id INTO check_id;
  
  -- Log admin action
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    details,
    timestamp
  ) VALUES (
    p_performed_by,
    'RUN_COMPLIANCE_CHECK',
    'Performed ' || p_type || ' compliance check. Result: ' || check_status,
    now()
  );
  
  RETURN check_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mint_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION burn_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_profit_distribution TO authenticated;
GRANT EXECUTE ON FUNCTION update_token_configuration TO authenticated;
GRANT EXECUTE ON FUNCTION get_token_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION run_compliance_check TO authenticated;

-- Insert initial token configuration
INSERT INTO token_configurations (name, symbol, decimals, max_supply)
VALUES ('DRONE Token', 'DRONE', 18, 100000000)
ON CONFLICT DO NOTHING;

-- Insert initial compliance checks
INSERT INTO token_compliance_checks (type, status, details, next_check_date, performed_by)
VALUES 
  ('aml', 'passed', 'All token holders passed AML screening', now() + interval '30 days', 'system'),
  ('sanctions', 'passed', 'No sanctions list matches found', now() + interval '30 days', 'system'),
  ('kyc', 'pending', '1 holder pending KYC verification', now() + interval '1 day', 'system'),
  ('accreditation', 'passed', 'All holders meet accreditation requirements', now() + interval '90 days', 'system')
ON CONFLICT DO NOTHING;

-- Insert initial token holders
INSERT INTO token_holders (address, balance, percentage, kyc_status, investment_tier, first_transaction_date)
VALUES 
  ('0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4', 125000, 0.125, 'verified', 'institutional', now() - interval '30 days'),
  ('0x8ba1f109551bD432803012645Hac136c0532925a', 500000, 0.5, 'verified', 'institutional', now() - interval '35 days'),
  ('0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', 75000, 0.075, 'pending', 'accredited', now() - interval '7 days')
ON CONFLICT DO NOTHING;

-- Insert initial transactions
INSERT INTO token_transactions (type, to_address, amount, status, timestamp)
VALUES 
  ('mint', '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4', 125000, 'confirmed', now() - interval '30 days'),
  ('mint', '0x8ba1f109551bD432803012645Hac136c0532925a', 500000, 'confirmed', now() - interval '35 days'),
  ('mint', '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', 75000, 'confirmed', now() - interval '7 days')
ON CONFLICT DO NOTHING;

-- Insert initial distribution
INSERT INTO token_distributions (amount, profit_period, distribution_date, eligible_holders, status)
VALUES 
  (0, 'Q4 2025', '2026-01-15T00:00:00Z', 3, 'scheduled')
ON CONFLICT DO NOTHING;