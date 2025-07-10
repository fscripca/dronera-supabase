/*
  # Create Wallet Transactions Table

  1. New Tables
    - `wallet_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text, enum: deposit/withdrawal/incoming/outgoing)
      - `amount` (numeric)
      - `token_type` (text, enum: EUR/DRONE/ETH)
      - `status` (text, enum: completed/pending/failed)
      - `description` (text)
      - `transaction_hash` (text, optional)
      - `from_address` (text, optional)
      - `to_address` (text, optional)
      - `fee` (numeric, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `completed_at` (timestamp, optional)

  2. Security
    - Enable RLS on `wallet_transactions` table
    - Add policies for users to read their own transactions
    - Add policies for service role to manage all transactions

  3. Functions
    - Create transaction
    - Update transaction status
    - Get user balance
*/

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'incoming', 'outgoing')),
  amount numeric NOT NULL,
  token_type text NOT NULL CHECK (token_type IN ('EUR', 'DRONE', 'ETH')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed')),
  description text,
  transaction_hash text,
  from_address text,
  to_address text,
  fee numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('card', 'bank', 'crypto')),
  name text NOT NULL,
  details text NOT NULL,
  is_default boolean DEFAULT false,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_wallet_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_wallet_transactions_updated_at ON wallet_transactions;
CREATE TRIGGER update_wallet_transactions_updated_at
  BEFORE UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_transactions_updated_at();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_token_type ON wallet_transactions(token_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can read own transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON wallet_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for payment_methods
CREATE POLICY "Users can read own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment methods"
  ON payment_methods
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to create a transaction
CREATE OR REPLACE FUNCTION create_wallet_transaction(
  p_user_id uuid,
  p_type text,
  p_amount numeric,
  p_token_type text,
  p_description text DEFAULT NULL,
  p_transaction_hash text DEFAULT NULL,
  p_from_address text DEFAULT NULL,
  p_to_address text DEFAULT NULL,
  p_fee numeric DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id uuid;
BEGIN
  -- Validate inputs
  IF p_type NOT IN ('deposit', 'withdrawal', 'incoming', 'outgoing') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_type;
  END IF;
  
  IF p_token_type NOT IN ('EUR', 'DRONE', 'ETH') THEN
    RAISE EXCEPTION 'Invalid token type: %', p_token_type;
  END IF;
  
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;
  
  -- Create transaction record
  INSERT INTO wallet_transactions (
    user_id,
    type,
    amount,
    token_type,
    description,
    transaction_hash,
    from_address,
    to_address,
    fee
  ) VALUES (
    p_user_id,
    p_type,
    p_amount,
    p_token_type,
    p_description,
    p_transaction_hash,
    p_from_address,
    p_to_address,
    p_fee
  ) RETURNING id INTO transaction_id;
  
  -- Update token balances if needed (in a real app)
  -- This would update the user's balance in the profiles table
  
  RETURN transaction_id;
END;
$$;

-- Function to update transaction status
CREATE OR REPLACE FUNCTION update_transaction_status(
  p_transaction_id uuid,
  p_status text,
  p_transaction_hash text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate status
  IF p_status NOT IN ('completed', 'pending', 'failed') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;
  
  -- Update transaction
  UPDATE wallet_transactions
  SET 
    status = p_status,
    transaction_hash = COALESCE(p_transaction_hash, transaction_hash),
    completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE id = p_transaction_id;
  
  RETURN FOUND;
END;
$$;

-- Function to get user balance
CREATE OR REPLACE FUNCTION get_user_balance(
  p_user_id uuid,
  p_token_type text
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance numeric := 0;
BEGIN
  -- Validate token type
  IF p_token_type NOT IN ('EUR', 'DRONE', 'ETH') THEN
    RAISE EXCEPTION 'Invalid token type: %', p_token_type;
  END IF;
  
  -- Calculate balance from transactions
  SELECT 
    COALESCE(
      SUM(
        CASE 
          WHEN type IN ('deposit', 'incoming') THEN amount
          WHEN type IN ('withdrawal', 'outgoing') THEN -amount
          ELSE 0
        END
      ), 
      0
    ) INTO balance
  FROM wallet_transactions
  WHERE 
    user_id = p_user_id AND 
    token_type = p_token_type AND
    status = 'completed';
  
  RETURN balance;
END;
$$;

-- Function to add payment method
CREATE OR REPLACE FUNCTION add_payment_method(
  p_user_id uuid,
  p_type text,
  p_name text,
  p_details text,
  p_is_default boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  method_id uuid;
BEGIN
  -- Validate type
  IF p_type NOT IN ('card', 'bank', 'crypto') THEN
    RAISE EXCEPTION 'Invalid payment method type: %', p_type;
  END IF;
  
  -- If setting as default, update existing methods
  IF p_is_default THEN
    UPDATE payment_methods
    SET 
      is_default = false,
      updated_at = now()
    WHERE 
      user_id = p_user_id AND
      is_default = true;
  END IF;
  
  -- Create payment method
  INSERT INTO payment_methods (
    user_id,
    type,
    name,
    details,
    is_default
  ) VALUES (
    p_user_id,
    p_type,
    p_name,
    p_details,
    p_is_default
  ) RETURNING id INTO method_id;
  
  RETURN method_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_wallet_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION update_transaction_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_balance TO authenticated;
GRANT EXECUTE ON FUNCTION add_payment_method TO authenticated;

-- Insert sample data for testing
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get a user ID (this is just for demo purposes)
  SELECT id INTO user_id FROM profiles LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    -- Insert sample transactions
    INSERT INTO wallet_transactions (
      user_id,
      type,
      amount,
      token_type,
      status,
      description,
      created_at
    ) VALUES
      (user_id, 'deposit', 10000, 'EUR', 'completed', 'Initial deposit', now() - interval '30 days'),
      (user_id, 'deposit', 5000, 'EUR', 'completed', 'Additional deposit', now() - interval '15 days'),
      (user_id, 'withdrawal', 2000, 'EUR', 'completed', 'Withdrawal to bank account', now() - interval '7 days'),
      (user_id, 'incoming', 125000, 'DRONE', 'completed', 'Token allocation', now() - interval '25 days'),
      (user_id, 'incoming', 0.5, 'ETH', 'completed', 'Gas fee reimbursement', now() - interval '20 days'),
      (user_id, 'outgoing', 0.1, 'ETH', 'completed', 'Gas fee for token transfer', now() - interval '10 days');
    
    -- Insert sample payment methods
    INSERT INTO payment_methods (
      user_id,
      type,
      name,
      details,
      is_default
    ) VALUES
      (user_id, 'card', 'Visa ending in 4242', 'Expires 12/26', true),
      (user_id, 'bank', 'Bank Transfer (SEPA)', 'IBAN: DE89 3704 0044 0532 0130 00', false);
  END IF;
END
$$;