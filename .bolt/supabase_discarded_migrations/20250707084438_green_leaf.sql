/*
  # Create Token Contract Integration Tables

  1. New Tables
    - `token_contracts` - Stores token contract addresses and configuration
    - `token_transactions` - Records token transactions (minting, transfers, etc.)
    - `token_holders` - Tracks token balances by wallet address
    - `token_vesting_schedules` - Manages token vesting schedules

  2. Security
    - Enable RLS on all tables
    - Add policies for users to view their own data
    - Add policies for service role to manage all data

  3. Functions
    - Get token balance for a user
    - Record token transaction
    - Calculate vested tokens
*/

-- Create token_contracts table
CREATE TABLE IF NOT EXISTS token_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'DRONE Token',
  symbol text NOT NULL DEFAULT 'DRN',
  address text NOT NULL,
  network text NOT NULL DEFAULT 'Base',
  chain_id integer NOT NULL DEFAULT 8453,
  decimals integer NOT NULL DEFAULT 18,
  total_supply numeric NOT NULL DEFAULT 100000000,
  owner_address text NOT NULL,
  implementation_address text,
  is_active boolean NOT NULL DEFAULT true,
  deployment_date timestamptz NOT NULL DEFAULT now(),
  last_updated timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES token_contracts(id),
  transaction_hash text NOT NULL,
  block_number bigint NOT NULL,
  from_address text NOT NULL,
  to_address text NOT NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('transfer', 'mint', 'burn', 'approve')),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),
  gas_price numeric,
  gas_used numeric,
  transaction_fee numeric,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create token_holders table
CREATE TABLE IF NOT EXISTS token_holders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES token_contracts(id),
  wallet_address text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  balance numeric NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now(),
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  is_whitelisted boolean NOT NULL DEFAULT false,
  is_blacklisted boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(contract_id, wallet_address)
);

-- Create token_vesting_schedules table
CREATE TABLE IF NOT EXISTS token_vesting_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid REFERENCES token_holders(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL,
  cliff_end_date timestamptz,
  end_date timestamptz NOT NULL,
  total_amount numeric NOT NULL,
  released_amount numeric NOT NULL DEFAULT 0,
  vesting_type text NOT NULL DEFAULT 'linear' CHECK (vesting_type IN ('linear', 'cliff', 'custom')),
  release_interval text NOT NULL DEFAULT 'monthly' CHECK (release_interval IN ('daily', 'weekly', 'monthly', 'quarterly')),
  is_revocable boolean NOT NULL DEFAULT false,
  is_revoked boolean NOT NULL DEFAULT false,
  revoked_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE token_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_vesting_schedules ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_contracts_address ON token_contracts(address);
CREATE INDEX IF NOT EXISTS idx_token_contracts_network ON token_contracts(network);

CREATE INDEX IF NOT EXISTS idx_token_transactions_contract_id ON token_transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_transaction_hash ON token_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_token_transactions_from_address ON token_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to_address ON token_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_token_transactions_timestamp ON token_transactions(timestamp);

CREATE INDEX IF NOT EXISTS idx_token_holders_contract_id ON token_holders(contract_id);
CREATE INDEX IF NOT EXISTS idx_token_holders_wallet_address ON token_holders(wallet_address);
CREATE INDEX IF NOT EXISTS idx_token_holders_user_id ON token_holders(user_id);
CREATE INDEX IF NOT EXISTS idx_token_holders_balance ON token_holders(balance);

CREATE INDEX IF NOT EXISTS idx_token_vesting_schedules_holder_id ON token_vesting_schedules(holder_id);
CREATE INDEX IF NOT EXISTS idx_token_vesting_schedules_start_date ON token_vesting_schedules(start_date);
CREATE INDEX IF NOT EXISTS idx_token_vesting_schedules_end_date ON token_vesting_schedules(end_date);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_token_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for token_holders
DROP TRIGGER IF EXISTS update_token_holders_updated_at ON token_holders;
CREATE TRIGGER update_token_holders_updated_at
  BEFORE UPDATE ON token_holders
  FOR EACH ROW
  EXECUTE FUNCTION update_token_updated_at_column();

-- Create trigger for token_vesting_schedules
DROP TRIGGER IF EXISTS update_token_vesting_schedules_updated_at ON token_vesting_schedules;
CREATE TRIGGER update_token_vesting_schedules_updated_at
  BEFORE UPDATE ON token_vesting_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for token_contracts
CREATE POLICY "Authenticated users can view token contracts"
  ON token_contracts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage token contracts"
  ON token_contracts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for token_transactions
CREATE POLICY "Authenticated users can view token transactions"
  ON token_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage token transactions"
  ON token_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for token_holders
CREATE POLICY "Authenticated users can view token holders"
  ON token_holders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own token holdings"
  ON token_holders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR wallet_address = (
    SELECT wallet_address FROM kyc_submissions 
    WHERE user_id = auth.uid() 
    ORDER BY submission_date DESC 
    LIMIT 1
  ));

CREATE POLICY "Service role can manage token holders"
  ON token_holders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for token_vesting_schedules
CREATE POLICY "Users can view their own vesting schedules"
  ON token_vesting_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM token_holders h
      WHERE h.id = holder_id AND (h.user_id = auth.uid() OR h.wallet_address = (
        SELECT wallet_address FROM kyc_submissions 
        WHERE user_id = auth.uid() 
        ORDER BY submission_date DESC 
        LIMIT 1
      ))
    )
  );

CREATE POLICY "Service role can manage vesting schedules"
  ON token_vesting_schedules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to get token balance for a user
CREATE OR REPLACE FUNCTION get_user_token_balance(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_wallet text;
BEGIN
  -- Get user's wallet address
  SELECT wallet_address INTO user_wallet
  FROM kyc_submissions
  WHERE user_id = p_user_id AND status = 'approved'
  ORDER BY submission_date DESC
  LIMIT 1;
  
  IF user_wallet IS NULL THEN
    -- Try to get from token_holders directly
    SELECT wallet_address INTO user_wallet
    FROM token_holders
    WHERE user_id = p_user_id
    LIMIT 1;
  END IF;
  
  IF user_wallet IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'No wallet address found for user'
    );
  END IF;
  
  -- Get token balance
  SELECT jsonb_build_object(
    'wallet_address', h.wallet_address,
    'balance', h.balance,
    'contract', jsonb_build_object(
      'name', c.name,
      'symbol', c.symbol,
      'address', c.address,
      'network', c.network
    ),
    'vesting', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', v.id,
        'total_amount', v.total_amount,
        'released_amount', v.released_amount,
        'start_date', v.start_date,
        'end_date', v.end_date,
        'vesting_type', v.vesting_type
      ))
      FROM token_vesting_schedules v
      WHERE v.holder_id = h.id
    ),
    'last_updated', h.last_updated
  ) INTO result
  FROM token_holders h
  JOIN token_contracts c ON h.contract_id = c.id
  WHERE h.wallet_address = user_wallet
  LIMIT 1;
  
  IF result IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'not_found',
      'message', 'No token balance found for user',
      'wallet_address', user_wallet
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'data', result
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$;

-- Function to record a token transaction
CREATE OR REPLACE FUNCTION record_token_transaction(
  p_contract_id uuid,
  p_transaction_hash text,
  p_block_number bigint,
  p_from_address text,
  p_to_address text,
  p_amount numeric,
  p_transaction_type text,
  p_gas_price numeric DEFAULT NULL,
  p_gas_used numeric DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id uuid;
  from_holder_id uuid;
  to_holder_id uuid;
  transaction_fee numeric;
BEGIN
  -- Calculate transaction fee if gas data is provided
  IF p_gas_price IS NOT NULL AND p_gas_used IS NOT NULL THEN
    transaction_fee := p_gas_price * p_gas_used;
  ELSE
    transaction_fee := NULL;
  END IF;
  
  -- Record the transaction
  INSERT INTO token_transactions (
    contract_id,
    transaction_hash,
    block_number,
    from_address,
    to_address,
    amount,
    transaction_type,
    gas_price,
    gas_used,
    transaction_fee,
    metadata
  ) VALUES (
    p_contract_id,
    p_transaction_hash,
    p_block_number,
    p_from_address,
    p_to_address,
    p_amount,
    p_transaction_type,
    p_gas_price,
    p_gas_used,
    transaction_fee,
    p_metadata
  ) RETURNING id INTO transaction_id;
  
  -- Update token balances if it's a transfer, mint, or burn
  IF p_transaction_type IN ('transfer', 'mint', 'burn') THEN
    -- Handle from_address (except for minting)
    IF p_transaction_type != 'mint' AND p_from_address != '0x0000000000000000000000000000000000000000' THEN
      -- Get or create holder record for from_address
      SELECT id INTO from_holder_id
      FROM token_holders
      WHERE contract_id = p_contract_id AND wallet_address = p_from_address;
      
      IF from_holder_id IS NULL THEN
        INSERT INTO token_holders (contract_id, wallet_address, balance)
        VALUES (p_contract_id, p_from_address, 0)
        RETURNING id INTO from_holder_id;
      END IF;
      
      -- Update balance
      UPDATE token_holders
      SET 
        balance = GREATEST(balance - p_amount, 0),
        last_updated = now()
      WHERE id = from_holder_id;
    END IF;
    
    -- Handle to_address (except for burning)
    IF p_transaction_type != 'burn' AND p_to_address != '0x0000000000000000000000000000000000000000' THEN
      -- Get or create holder record for to_address
      SELECT id INTO to_holder_id
      FROM token_holders
      WHERE contract_id = p_contract_id AND wallet_address = p_to_address;
      
      IF to_holder_id IS NULL THEN
        INSERT INTO token_holders (contract_id, wallet_address, balance)
        VALUES (p_contract_id, p_to_address, p_amount)
        RETURNING id INTO to_holder_id;
      ELSE
        -- Update balance
        UPDATE token_holders
        SET 
          balance = balance + p_amount,
          last_updated = now()
        WHERE id = to_holder_id;
      END IF;
    END IF;
  END IF;
  
  RETURN transaction_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Function to calculate vested tokens
CREATE OR REPLACE FUNCTION calculate_vested_tokens(p_vesting_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vesting_record token_vesting_schedules%ROWTYPE;
  current_time timestamptz := now();
  vested_amount numeric := 0;
  releasable_amount numeric := 0;
  vesting_progress numeric := 0;
  result jsonb;
BEGIN
  -- Get vesting schedule
  SELECT * INTO vesting_record
  FROM token_vesting_schedules
  WHERE id = p_vesting_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Vesting schedule not found'
    );
  END IF;
  
  -- Check if vesting is revoked
  IF vesting_record.is_revoked THEN
    RETURN jsonb_build_object(
      'status', 'revoked',
      'vested_amount', vesting_record.released_amount,
      'releasable_amount', 0,
      'total_amount', vesting_record.total_amount,
      'vesting_progress', vesting_record.released_amount / vesting_record.total_amount * 100
    );
  END IF;
  
  -- Check if vesting hasn't started yet
  IF current_time < vesting_record.start_date THEN
    RETURN jsonb_build_object(
      'status', 'not_started',
      'vested_amount', 0,
      'releasable_amount', 0,
      'total_amount', vesting_record.total_amount,
      'vesting_progress', 0,
      'start_date', vesting_record.start_date
    );
  END IF;
  
  -- Check if cliff period is active
  IF vesting_record.cliff_end_date IS NOT NULL AND current_time < vesting_record.cliff_end_date THEN
    RETURN jsonb_build_object(
      'status', 'cliff',
      'vested_amount', 0,
      'releasable_amount', 0,
      'total_amount', vesting_record.total_amount,
      'vesting_progress', 0,
      'cliff_end_date', vesting_record.cliff_end_date
    );
  END IF;
  
  -- Check if vesting is complete
  IF current_time >= vesting_record.end_date THEN
    vested_amount := vesting_record.total_amount;
    releasable_amount := vested_amount - vesting_record.released_amount;
    vesting_progress := 100;
    
    RETURN jsonb_build_object(
      'status', 'completed',
      'vested_amount', vested_amount,
      'releasable_amount', releasable_amount,
      'total_amount', vesting_record.total_amount,
      'vesting_progress', vesting_progress,
      'end_date', vesting_record.end_date
    );
  END IF;
  
  -- Calculate vested amount for linear vesting
  IF vesting_record.vesting_type = 'linear' THEN
    -- If cliff has passed or there is no cliff
    IF vesting_record.cliff_end_date IS NULL OR current_time >= vesting_record.cliff_end_date THEN
      -- Calculate the time elapsed since start (or cliff end if applicable)
      DECLARE
        vesting_start timestamptz;
        total_vesting_duration interval;
        elapsed_duration interval;
        elapsed_ratio numeric;
      BEGIN
        vesting_start := COALESCE(vesting_record.cliff_end_date, vesting_record.start_date);
        total_vesting_duration := vesting_record.end_date - vesting_start;
        elapsed_duration := LEAST(current_time - vesting_start, total_vesting_duration);
        
        -- Calculate the ratio of elapsed time to total duration
        elapsed_ratio := EXTRACT(EPOCH FROM elapsed_duration) / EXTRACT(EPOCH FROM total_vesting_duration);
        
        -- Calculate vested amount
        vested_amount := vesting_record.total_amount * elapsed_ratio;
        releasable_amount := vested_amount - vesting_record.released_amount;
        vesting_progress := elapsed_ratio * 100;
      END;
    END IF;
  ELSIF vesting_record.vesting_type = 'cliff' THEN
    -- For cliff vesting, tokens are only vested at the end
    vested_amount := 0;
    releasable_amount := 0;
    vesting_progress := (EXTRACT(EPOCH FROM (current_time - vesting_record.start_date)) / 
                         EXTRACT(EPOCH FROM (vesting_record.end_date - vesting_record.start_date))) * 100;
  ELSE
    -- For custom vesting, we would need to implement specific logic
    -- This is a placeholder for custom vesting logic
    vested_amount := 0;
    releasable_amount := 0;
    vesting_progress := 0;
  END IF;
  
  RETURN jsonb_build_object(
    'status', 'active',
    'vested_amount', vested_amount,
    'releasable_amount', releasable_amount,
    'total_amount', vesting_record.total_amount,
    'vesting_progress', vesting_progress,
    'start_date', vesting_record.start_date,
    'cliff_end_date', vesting_record.cliff_end_date,
    'end_date', vesting_record.end_date
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_token_balance TO authenticated;
GRANT EXECUTE ON FUNCTION record_token_transaction TO service_role;
GRANT EXECUTE ON FUNCTION calculate_vested_tokens TO authenticated;

-- Insert default token contract
INSERT INTO token_contracts (
  name,
  symbol,
  address,
  network,
  chain_id,
  decimals,
  total_supply,
  owner_address,
  deployment_date
) VALUES (
  'DRONE Token',
  'DRN',
  '0x1234567890123456789012345678901234567890', -- Replace with actual contract address
  'Base',
  8453,
  18,
  100000000,
  '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4', -- Replace with actual owner address
  now()
) ON CONFLICT DO NOTHING;