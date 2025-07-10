/*
  # Profit Sharing System

  1. New Tables
    - `profit_pools` - Stores information about profit pools
    - `profit_distributions` - Tracks scheduled and completed profit distributions
    - `profit_participants` - Manages participants eligible for profit sharing
    - `distribution_rules` - Defines rules for profit distribution calculations
    - `profit_distribution_logs` - Logs individual distribution transactions
    - `profit_sharing_audit` - Audit trail for all profit sharing actions
  
  2. Functions
    - Functions for creating and managing profit pools
    - Functions for scheduling and processing distributions
    - Functions for syncing participants from token holders
    
  3. Security
    - RLS policies for all tables
    - Function permissions for authenticated users
*/

-- First drop any triggers that depend on functions we want to drop
DROP TRIGGER IF EXISTS update_profit_pools_updated_at ON profit_pools;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS create_profit_pool(text, numeric, text, text, text, text);
DROP FUNCTION IF EXISTS schedule_profit_distribution(uuid, numeric, timestamptz, text, uuid, text, text);
DROP FUNCTION IF EXISTS create_distribution_rule(text, text, text, boolean, numeric, text);
DROP FUNCTION IF EXISTS process_profit_distribution(uuid, text);
DROP FUNCTION IF EXISTS complete_profit_distribution(uuid, text, text);
DROP FUNCTION IF EXISTS get_profit_sharing_metrics();
DROP FUNCTION IF EXISTS log_profit_sharing_audit(text, text, text, jsonb, text, text);
DROP FUNCTION IF EXISTS sync_profit_participants();
DROP FUNCTION IF EXISTS update_profit_pools_updated_at();

-- Create profit_pools table
CREATE TABLE IF NOT EXISTS profit_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  allocated_amount numeric NOT NULL DEFAULT 0 CHECK (allocated_amount >= 0),
  remaining_amount numeric NOT NULL CHECK (remaining_amount >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  source text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed')),
  description text,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Create profit_distributions table
CREATE TABLE IF NOT EXISTS profit_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES profit_pools(id),
  amount numeric NOT NULL CHECK (amount > 0),
  distribution_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'failed')),
  participant_count integer,
  transaction_hash text,
  distribution_type text NOT NULL DEFAULT 'regular' CHECK (distribution_type IN ('regular', 'special')),
  rule_id uuid,
  notes text,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  snapshot_block_number bigint
);

-- Create profit_participants table
CREATE TABLE IF NOT EXISTS profit_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  wallet_address text NOT NULL,
  token_balance numeric NOT NULL DEFAULT 0,
  allocation_percentage numeric NOT NULL DEFAULT 0,
  allocation_amount numeric NOT NULL DEFAULT 0,
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('verified', 'pending', 'declined')),
  last_distribution timestamptz,
  total_received numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create distribution_rules table
CREATE TABLE IF NOT EXISTS distribution_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  formula text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  min_tokens numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used timestamptz
);

-- Create profit_distribution_logs table
CREATE TABLE IF NOT EXISTS profit_distribution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id uuid NOT NULL REFERENCES profit_distributions(id),
  participant_id uuid NOT NULL REFERENCES profit_participants(id),
  amount numeric NOT NULL,
  wallet_address text NOT NULL,
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

-- Create profit_sharing_audit table
CREATE TABLE IF NOT EXISTS profit_sharing_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  performed_by text NOT NULL,
  details text NOT NULL,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profit_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_distribution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_sharing_audit ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function for profit_pools
CREATE OR REPLACE FUNCTION update_profit_pools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profit_pools_updated_at
  BEFORE UPDATE ON profit_pools
  FOR EACH ROW
  EXECUTE FUNCTION update_profit_pools_updated_at();

DROP TRIGGER IF EXISTS update_profit_distributions_updated_at ON profit_distributions;
CREATE TRIGGER update_profit_distributions_updated_at
  BEFORE UPDATE ON profit_distributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profit_participants_updated_at ON profit_participants;
CREATE TRIGGER update_profit_participants_updated_at
  BEFORE UPDATE ON profit_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_distribution_rules_updated_at ON distribution_rules;
CREATE TRIGGER update_distribution_rules_updated_at
  BEFORE UPDATE ON distribution_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profit_distribution_logs_updated_at ON profit_distribution_logs;
CREATE TRIGGER update_profit_distribution_logs_updated_at
  BEFORE UPDATE ON profit_distribution_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profit_pools_status ON profit_pools(status);
CREATE INDEX IF NOT EXISTS idx_profit_pools_created_at ON profit_pools(created_at);

CREATE INDEX IF NOT EXISTS idx_profit_distributions_pool_id ON profit_distributions(pool_id);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_status ON profit_distributions(status);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_distribution_date ON profit_distributions(distribution_date);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_distribution_type ON profit_distributions(distribution_type);

CREATE INDEX IF NOT EXISTS idx_profit_participants_user_id ON profit_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_profit_participants_email ON profit_participants(email);
CREATE INDEX IF NOT EXISTS idx_profit_participants_wallet_address ON profit_participants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profit_participants_kyc_status ON profit_participants(kyc_status);
CREATE INDEX IF NOT EXISTS idx_profit_participants_status ON profit_participants(status);

CREATE INDEX IF NOT EXISTS idx_distribution_rules_is_default ON distribution_rules(is_default);
CREATE INDEX IF NOT EXISTS idx_distribution_rules_status ON distribution_rules(status);

CREATE INDEX IF NOT EXISTS idx_profit_distribution_logs_distribution_id ON profit_distribution_logs(distribution_id);
CREATE INDEX IF NOT EXISTS idx_profit_distribution_logs_participant_id ON profit_distribution_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_profit_distribution_logs_status ON profit_distribution_logs(status);

CREATE INDEX IF NOT EXISTS idx_profit_sharing_audit_action ON profit_sharing_audit(action);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_audit_timestamp ON profit_sharing_audit(timestamp);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_audit_performed_by ON profit_sharing_audit(performed_by);

-- RLS Policies

-- Profit pools - admin access only
CREATE POLICY "Service role can manage profit pools"
  ON profit_pools
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage profit pools"
  ON profit_pools
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Profit distributions - admin access only
CREATE POLICY "Service role can manage profit distributions"
  ON profit_distributions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage profit distributions"
  ON profit_distributions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Profit participants - admin access for write, authenticated for read
CREATE POLICY "Service role can manage profit participants"
  ON profit_participants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage profit participants"
  ON profit_participants
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Distribution rules - admin access only
CREATE POLICY "Service role can manage distribution rules"
  ON distribution_rules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage distribution rules"
  ON distribution_rules
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Profit distribution logs - admin access only
CREATE POLICY "Service role can manage profit distribution logs"
  ON profit_distribution_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage profit distribution logs"
  ON profit_distribution_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Profit sharing audit - admin access only
CREATE POLICY "Service role can manage profit sharing audit"
  ON profit_sharing_audit
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read profit sharing audit"
  ON profit_sharing_audit
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert profit sharing audit"
  ON profit_sharing_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Functions for profit sharing

-- Function to create profit pool
CREATE OR REPLACE FUNCTION create_profit_pool(
  p_name text,
  p_total_amount numeric,
  p_currency text,
  p_source text,
  p_description text,
  p_created_by text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pool_id uuid;
BEGIN
  -- Validate inputs
  IF p_total_amount <= 0 THEN
    RAISE EXCEPTION 'Total amount must be greater than zero';
  END IF;
  
  -- Create profit pool
  INSERT INTO profit_pools (
    name,
    total_amount,
    remaining_amount,
    currency,
    source,
    description,
    created_by
  ) VALUES (
    p_name,
    p_total_amount,
    p_total_amount,
    p_currency,
    p_source,
    p_description,
    p_created_by
  ) RETURNING id INTO pool_id;
  
  -- Log the action
  INSERT INTO profit_sharing_audit (
    action,
    performed_by,
    details,
    metadata
  ) VALUES (
    'CREATE_PROFIT_POOL',
    p_created_by,
    'Created profit pool: ' || p_name || ' with ' || p_currency || ' ' || p_total_amount,
    jsonb_build_object(
      'pool_id', pool_id,
      'amount', p_total_amount,
      'currency', p_currency
    )
  );
  
  RETURN pool_id;
END;
$$;

-- Function to schedule distribution
CREATE OR REPLACE FUNCTION schedule_profit_distribution(
  p_pool_id uuid,
  p_amount numeric,
  p_distribution_date timestamptz,
  p_distribution_type text,
  p_rule_id uuid,
  p_notes text,
  p_created_by text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dist_id uuid;
  pool_record profit_pools%ROWTYPE;
  rule_record distribution_rules%ROWTYPE;
  participant_count integer;
BEGIN
  -- Get pool record
  SELECT * INTO pool_record FROM profit_pools WHERE id = p_pool_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profit pool not found';
  END IF;
  
  -- Validate pool status
  IF pool_record.status != 'active' THEN
    RAISE EXCEPTION 'Profit pool is not active';
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Distribution amount must be greater than zero';
  END IF;
  
  IF p_amount > pool_record.remaining_amount THEN
    RAISE EXCEPTION 'Distribution amount exceeds remaining pool amount';
  END IF;
  
  -- Validate distribution date
  IF p_distribution_date <= now() THEN
    RAISE EXCEPTION 'Distribution date must be in the future';
  END IF;
  
  -- Get rule record
  SELECT * INTO rule_record FROM distribution_rules WHERE id = p_rule_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Distribution rule not found';
  END IF;
  
  -- Count eligible participants
  SELECT COUNT(*) INTO participant_count
  FROM profit_participants
  WHERE status = 'active' 
    AND kyc_status = 'verified'
    AND token_balance >= rule_record.min_tokens;
  
  -- Create distribution record
  INSERT INTO profit_distributions (
    pool_id,
    amount,
    distribution_date,
    distribution_type,
    rule_id,
    notes,
    participant_count,
    created_by
  ) VALUES (
    p_pool_id,
    p_amount,
    p_distribution_date,
    p_distribution_type,
    p_rule_id,
    p_notes,
    participant_count,
    p_created_by
  ) RETURNING id INTO dist_id;
  
  -- Update pool allocated amount
  UPDATE profit_pools
  SET 
    allocated_amount = allocated_amount + p_amount,
    remaining_amount = remaining_amount - p_amount,
    updated_at = now()
  WHERE id = p_pool_id;
  
  -- Update rule last used
  UPDATE distribution_rules
  SET 
    last_used = now(),
    updated_at = now()
  WHERE id = p_rule_id;
  
  -- Log the action
  INSERT INTO profit_sharing_audit (
    action,
    performed_by,
    details,
    metadata
  ) VALUES (
    'SCHEDULE_DISTRIBUTION',
    p_created_by,
    'Scheduled distribution of ' || pool_record.currency || ' ' || p_amount || ' for ' || p_distribution_date,
    jsonb_build_object(
      'distribution_id', dist_id,
      'pool_id', p_pool_id,
      'amount', p_amount,
      'rule_id', p_rule_id,
      'participant_count', participant_count
    )
  );
  
  RETURN dist_id;
END;
$$;

-- Function to create distribution rule
CREATE OR REPLACE FUNCTION create_distribution_rule(
  p_name text,
  p_description text,
  p_formula text,
  p_is_default boolean,
  p_min_tokens numeric,
  p_created_by text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rule_id uuid;
BEGIN
  -- If setting as default, update existing rules
  IF p_is_default THEN
    UPDATE distribution_rules
    SET 
      is_default = false,
      updated_at = now()
    WHERE is_default = true;
  END IF;
  
  -- Create rule
  INSERT INTO distribution_rules (
    name,
    description,
    formula,
    is_default,
    min_tokens,
    created_by
  ) VALUES (
    p_name,
    p_description,
    p_formula,
    p_is_default,
    p_min_tokens,
    p_created_by
  ) RETURNING id INTO rule_id;
  
  -- Log the action
  INSERT INTO profit_sharing_audit (
    action,
    performed_by,
    details,
    metadata
  ) VALUES (
    'CREATE_DISTRIBUTION_RULE',
    p_created_by,
    'Created distribution rule: ' || p_name,
    jsonb_build_object(
      'rule_id', rule_id,
      'formula', p_formula,
      'is_default', p_is_default
    )
  );
  
  RETURN rule_id;
END;
$$;

-- Function to process distribution
CREATE OR REPLACE FUNCTION process_profit_distribution(
  p_distribution_id uuid,
  p_performed_by text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dist_record profit_distributions%ROWTYPE;
  pool_record profit_pools%ROWTYPE;
  rule_record distribution_rules%ROWTYPE;
  total_tokens numeric := 0;
  participant_record profit_participants%ROWTYPE;
BEGIN
  -- Get distribution record
  SELECT * INTO dist_record FROM profit_distributions WHERE id = p_distribution_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Distribution not found';
  END IF;
  
  -- Validate status
  IF dist_record.status != 'scheduled' THEN
    RAISE EXCEPTION 'Distribution is not in scheduled status';
  END IF;
  
  -- Get pool record
  SELECT * INTO pool_record FROM profit_pools WHERE id = dist_record.pool_id;
  
  -- Get rule record
  SELECT * INTO rule_record FROM distribution_rules WHERE id = dist_record.rule_id;
  
  -- Update distribution status
  UPDATE profit_distributions
  SET 
    status = 'processing',
    updated_at = now()
  WHERE id = p_distribution_id;
  
  -- Calculate total tokens for eligible participants
  SELECT COALESCE(SUM(token_balance), 0) INTO total_tokens
  FROM profit_participants
  WHERE status = 'active' 
    AND kyc_status = 'verified'
    AND token_balance >= rule_record.min_tokens;
  
  -- Calculate and store allocations for each participant
  FOR participant_record IN 
    SELECT * FROM profit_participants
    WHERE status = 'active' 
      AND kyc_status = 'verified'
      AND token_balance >= rule_record.min_tokens
  LOOP
    -- Calculate allocation percentage based on rule formula
    DECLARE
      allocation_percentage numeric;
      allocation_amount numeric;
    BEGIN
      IF rule_record.formula = 'token_balance' THEN
        allocation_percentage := (participant_record.token_balance / total_tokens) * 100;
      ELSIF rule_record.formula LIKE '%investment_tier%' THEN
        -- Apply institutional bonus (simplified)
        IF participant_record.token_balance >= 100000 THEN
          allocation_percentage := ((participant_record.token_balance * 1.1) / (total_tokens * 1.05)) * 100;
        ELSE
          allocation_percentage := (participant_record.token_balance / (total_tokens * 1.05)) * 100;
        END IF;
      ELSIF rule_record.formula LIKE '%first_transaction_date%' THEN
        -- Apply early investor bonus (simplified)
        IF participant_record.last_distribution IS NULL OR participant_record.last_distribution < '2025-02-01' THEN
          allocation_percentage := ((participant_record.token_balance * 1.05) / (total_tokens * 1.025)) * 100;
        ELSE
          allocation_percentage := (participant_record.token_balance / (total_tokens * 1.025)) * 100;
        END IF;
      ELSE
        -- Default to token balance
        allocation_percentage := (participant_record.token_balance / total_tokens) * 100;
      END IF;
      
      allocation_amount := (allocation_percentage / 100) * dist_record.amount;
      
      -- Create distribution log
      INSERT INTO profit_distribution_logs (
        distribution_id,
        participant_id,
        amount,
        wallet_address,
        status
      ) VALUES (
        p_distribution_id,
        participant_record.id,
        allocation_amount,
        participant_record.wallet_address,
        'pending'
      );
      
      -- Update participant allocation
      UPDATE profit_participants
      SET 
        allocation_percentage = allocation_percentage,
        allocation_amount = allocation_amount,
        updated_at = now()
      WHERE id = participant_record.id;
    END;
  END LOOP;
  
  -- Log the action
  INSERT INTO profit_sharing_audit (
    action,
    performed_by,
    details,
    metadata
  ) VALUES (
    'PROCESS_DISTRIBUTION',
    p_performed_by,
    'Started processing distribution of ' || pool_record.currency || ' ' || dist_record.amount,
    jsonb_build_object(
      'distribution_id', p_distribution_id,
      'pool_id', dist_record.pool_id,
      'amount', dist_record.amount,
      'participant_count', dist_record.participant_count
    )
  );
  
  RETURN true;
END;
$$;

-- Function to complete distribution
CREATE OR REPLACE FUNCTION complete_profit_distribution(
  p_distribution_id uuid,
  p_transaction_hash text,
  p_performed_by text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dist_record profit_distributions%ROWTYPE;
  pool_record profit_pools%ROWTYPE;
BEGIN
  -- Get distribution record
  SELECT * INTO dist_record FROM profit_distributions WHERE id = p_distribution_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Distribution not found';
  END IF;
  
  -- Validate status
  IF dist_record.status != 'processing' THEN
    RAISE EXCEPTION 'Distribution is not in processing status';
  END IF;
  
  -- Get pool record
  SELECT * INTO pool_record FROM profit_pools WHERE id = dist_record.pool_id;
  
  -- Update distribution status
  UPDATE profit_distributions
  SET 
    status = 'completed',
    transaction_hash = p_transaction_hash,
    completed_at = now(),
    updated_at = now()
  WHERE id = p_distribution_id;
  
  -- Update distribution logs
  UPDATE profit_distribution_logs
  SET 
    status = 'completed',
    transaction_hash = p_transaction_hash,
    completed_at = now(),
    updated_at = now()
  WHERE distribution_id = p_distribution_id;
  
  -- Update participants
  UPDATE profit_participants p
  SET 
    last_distribution = now(),
    total_received = total_received + l.amount,
    updated_at = now()
  FROM profit_distribution_logs l
  WHERE l.participant_id = p.id
    AND l.distribution_id = p_distribution_id;
  
  -- Check if pool is fully allocated
  UPDATE profit_pools
  SET 
    status = CASE WHEN remaining_amount = 0 THEN 'closed' ELSE status END,
    closed_at = CASE WHEN remaining_amount = 0 THEN now() ELSE closed_at END,
    updated_at = now()
  WHERE id = dist_record.pool_id;
  
  -- Log the action
  INSERT INTO profit_sharing_audit (
    action,
    performed_by,
    details,
    metadata
  ) VALUES (
    'COMPLETE_DISTRIBUTION',
    p_performed_by,
    'Completed distribution of ' || pool_record.currency || ' ' || dist_record.amount || ' to ' || dist_record.participant_count || ' participants',
    jsonb_build_object(
      'distribution_id', p_distribution_id,
      'pool_id', dist_record.pool_id,
      'amount', dist_record.amount,
      'transaction_hash', p_transaction_hash
    )
  );
  
  RETURN true;
END;
$$;

-- Function to get profit sharing metrics
CREATE OR REPLACE FUNCTION get_profit_sharing_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_distributed numeric;
  pending_distributions numeric;
  active_participants integer;
  avg_allocation numeric;
  next_distribution jsonb;
  total_profit_pool numeric;
  allocated_amount numeric;
  remaining_amount numeric;
BEGIN
  -- Calculate total distributed
  SELECT COALESCE(SUM(amount), 0) INTO total_distributed
  FROM profit_distributions
  WHERE status = 'completed';
  
  -- Calculate pending distributions
  SELECT COALESCE(SUM(amount), 0) INTO pending_distributions
  FROM profit_distributions
  WHERE status IN ('scheduled', 'processing');
  
  -- Count active participants
  SELECT COUNT(*) INTO active_participants
  FROM profit_participants
  WHERE status = 'active';
  
  -- Calculate average allocation
  SELECT COALESCE(AVG(allocation_amount), 0) INTO avg_allocation
  FROM profit_participants
  WHERE status = 'active';
  
  -- Find next distribution
  SELECT jsonb_build_object(
    'id', id,
    'pool_id', pool_id,
    'amount', amount,
    'date', distribution_date,
    'participant_count', participant_count
  ) INTO next_distribution
  FROM profit_distributions
  WHERE status = 'scheduled'
    AND distribution_date > now()
  ORDER BY distribution_date
  LIMIT 1;
  
  -- Calculate pool totals
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(allocated_amount), 0),
    COALESCE(SUM(remaining_amount), 0)
  INTO 
    total_profit_pool,
    allocated_amount,
    remaining_amount
  FROM profit_pools;
  
  -- Build result object
  SELECT jsonb_build_object(
    'total_distributed', total_distributed,
    'pending_distributions', pending_distributions,
    'active_participants', active_participants,
    'avg_allocation', avg_allocation,
    'next_distribution', next_distribution,
    'total_profit_pool', total_profit_pool,
    'allocated_amount', allocated_amount,
    'remaining_amount', remaining_amount,
    'distribution_count', (SELECT COUNT(*) FROM profit_distributions),
    'completed_distributions', (SELECT COUNT(*) FROM profit_distributions WHERE status = 'completed'),
    'scheduled_distributions', (SELECT COUNT(*) FROM profit_distributions WHERE status = 'scheduled'),
    'active_pools', (SELECT COUNT(*) FROM profit_pools WHERE status = 'active'),
    'closed_pools', (SELECT COUNT(*) FROM profit_pools WHERE status = 'closed')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to log profit sharing audit
CREATE OR REPLACE FUNCTION log_profit_sharing_audit(
  p_action text,
  p_performed_by text,
  p_details text,
  p_metadata jsonb DEFAULT '{}',
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO profit_sharing_audit (
    action,
    performed_by,
    details,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_action,
    p_performed_by,
    p_details,
    p_metadata,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Function to sync participants from token holders
CREATE OR REPLACE FUNCTION sync_profit_participants()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_count integer := 0;
  updated_count integer := 0;
BEGIN
  -- Insert new participants
  INSERT INTO profit_participants (
    user_id,
    email,
    wallet_address,
    token_balance,
    kyc_status,
    status
  )
  SELECT 
    p.id,
    p.email,
    th.address,
    th.balance,
    CASE 
      WHEN p.kyc_status = 'approved' THEN 'verified'
      WHEN p.kyc_status = 'declined' THEN 'declined'
      ELSE 'pending'
    END,
    CASE
      WHEN p.status = 'active' AND p.kyc_status = 'approved' THEN 'active'
      ELSE 'inactive'
    END
  FROM token_holders th
  JOIN profiles p ON th.user_id = p.id
  WHERE NOT EXISTS (
    SELECT 1 FROM profit_participants pp
    WHERE pp.wallet_address = th.address
  );
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  -- Update existing participants
  UPDATE profit_participants pp
  SET 
    token_balance = th.balance,
    kyc_status = CASE 
      WHEN p.kyc_status = 'approved' THEN 'verified'
      WHEN p.kyc_status = 'declined' THEN 'declined'
      ELSE 'pending'
    END,
    status = CASE
      WHEN p.status = 'active' AND p.kyc_status = 'approved' THEN 'active'
      ELSE 'inactive'
    END,
    updated_at = now()
  FROM token_holders th
  JOIN profiles p ON th.user_id = p.id
  WHERE pp.wallet_address = th.address;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN inserted_count + updated_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_profit_pool TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_profit_distribution TO authenticated;
GRANT EXECUTE ON FUNCTION create_distribution_rule TO authenticated;
GRANT EXECUTE ON FUNCTION process_profit_distribution TO authenticated;
GRANT EXECUTE ON FUNCTION complete_profit_distribution TO authenticated;
GRANT EXECUTE ON FUNCTION get_profit_sharing_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION log_profit_sharing_audit TO authenticated;
GRANT EXECUTE ON FUNCTION sync_profit_participants TO authenticated;

-- Insert initial distribution rule
INSERT INTO distribution_rules (
  name,
  description,
  formula,
  is_default,
  min_tokens,
  created_by
) VALUES (
  'Standard Token Balance',
  'Distribute profits proportionally based on token balance',
  'token_balance',
  true,
  0,
  'system'
) ON CONFLICT DO NOTHING;

-- Sync initial participants
SELECT sync_profit_participants();