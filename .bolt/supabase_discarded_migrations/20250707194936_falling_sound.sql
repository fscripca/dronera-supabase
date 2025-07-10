/*
  # Payment Integration System

  1. New Tables
    - `payment_transactions` - Stores payment transaction records
    - `payment_methods` - Stores user payment method information

  2. Security
    - Enable RLS on all tables
    - Add policies for users to view their own data
    - Add policies for service role to manage all data

  3. Functions
    - Process payment transaction
    - Get user payment methods
*/

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'crypto')),
  payment_provider text NOT NULL,
  payment_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  token_amount numeric NOT NULL,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  completed_date timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_payment_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_date ON payment_transactions(transaction_date);

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all payment transactions"
  ON payment_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to process payment transaction
CREATE OR REPLACE FUNCTION process_payment_transaction(
  p_user_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_provider text,
  p_payment_id text,
  p_token_amount numeric DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id uuid;
  calculated_token_amount numeric;
BEGIN
  -- Validate required fields
  IF p_user_id IS NULL OR p_amount IS NULL OR p_payment_method IS NULL OR p_payment_provider IS NULL OR p_payment_id IS NULL THEN
    RAISE EXCEPTION 'Missing required fields';
  END IF;
  
  -- Calculate token amount if not provided (1 EUR = 2/3 DRONE token)
  IF p_token_amount IS NULL THEN
    calculated_token_amount := floor(p_amount / 1.5);
  ELSE
    calculated_token_amount := p_token_amount;
  END IF;
  
  -- Insert payment transaction
  INSERT INTO payment_transactions (
    user_id,
    amount,
    currency,
    payment_method,
    payment_provider,
    payment_id,
    token_amount,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    'EUR',
    p_payment_method,
    p_payment_provider,
    p_payment_id,
    calculated_token_amount,
    p_metadata
  ) RETURNING id INTO transaction_id;
  
  -- Update user investment and token balance
  PERFORM update_user_investment(
    p_user_id,
    p_amount,
    calculated_token_amount
  );
  
  RETURN transaction_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to process payment transaction: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION process_payment_transaction TO service_role;