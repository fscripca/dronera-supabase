/*
  # Create Bank Account Management Tables

  1. New Tables
    - `bank_accounts` - Stores user bank account information
    - `bank_transactions` - Records bank deposits and withdrawals
    - `payment_methods` - Stores user payment methods

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for service role to manage all data

  3. Functions
    - Add bank account
    - Process bank transaction
    - Get user bank accounts
*/

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  bank_code text,
  iban text,
  swift_bic text,
  account_type text NOT NULL DEFAULT 'personal' CHECK (account_type IN ('personal', 'business')),
  currency text NOT NULL DEFAULT 'EUR',
  is_primary boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  verification_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create bank_transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reference_number text,
  description text,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  completed_date timestamptz,
  fee numeric DEFAULT 0,
  exchange_rate numeric DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type text NOT NULL CHECK (method_type IN ('bank_transfer', 'credit_card', 'debit_card', 'crypto')),
  provider text,
  account_number text,
  expiry_date text,
  cardholder_name text,
  is_default boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_user_id ON bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank_account_id ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON bank_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_transaction_date ON bank_transactions(transaction_date);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_method_type ON payment_methods(method_type);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_bank_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_transactions_updated_at ON bank_transactions;
CREATE TRIGGER update_bank_transactions_updated_at
  BEFORE UPDATE ON bank_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_updated_at_column();

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bank accounts"
  ON bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bank accounts"
  ON bank_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own bank accounts"
  ON bank_accounts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all bank accounts"
  ON bank_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for bank_transactions
CREATE POLICY "Users can view their own bank transactions"
  ON bank_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bank transactions"
  ON bank_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all bank transactions"
  ON bank_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all payment methods"
  ON payment_methods
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to add a bank account
CREATE OR REPLACE FUNCTION add_bank_account(
  p_user_id uuid,
  p_account_name text,
  p_account_number text,
  p_bank_name text,
  p_bank_code text DEFAULT NULL,
  p_iban text DEFAULT NULL,
  p_swift_bic text DEFAULT NULL,
  p_account_type text DEFAULT 'personal',
  p_currency text DEFAULT 'EUR',
  p_is_primary boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_id uuid;
BEGIN
  -- Validate required fields
  IF p_account_name IS NULL OR p_account_number IS NULL OR p_bank_name IS NULL THEN
    RAISE EXCEPTION 'Account name, account number, and bank name are required';
  END IF;
  
  -- If setting as primary, update existing primary accounts
  IF p_is_primary THEN
    UPDATE bank_accounts
    SET is_primary = false
    WHERE user_id = p_user_id AND is_primary = true;
  END IF;
  
  -- Insert new bank account
  INSERT INTO bank_accounts (
    user_id,
    account_name,
    account_number,
    bank_name,
    bank_code,
    iban,
    swift_bic,
    account_type,
    currency,
    is_primary
  ) VALUES (
    p_user_id,
    p_account_name,
    p_account_number,
    p_bank_name,
    p_bank_code,
    p_iban,
    p_swift_bic,
    p_account_type,
    p_currency,
    p_is_primary
  ) RETURNING id INTO account_id;
  
  RETURN account_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Function to process a bank transaction
CREATE OR REPLACE FUNCTION process_bank_transaction(
  p_user_id uuid,
  p_bank_account_id uuid,
  p_transaction_type text,
  p_amount numeric,
  p_currency text DEFAULT 'EUR',
  p_reference_number text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id uuid;
  bank_account_record bank_accounts%ROWTYPE;
BEGIN
  -- Validate required fields
  IF p_bank_account_id IS NULL OR p_transaction_type IS NULL OR p_amount IS NULL THEN
    RAISE EXCEPTION 'Bank account ID, transaction type, and amount are required';
  END IF;
  
  -- Validate transaction type
  IF p_transaction_type NOT IN ('deposit', 'withdrawal') THEN
    RAISE EXCEPTION 'Invalid transaction type. Must be deposit or withdrawal';
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;
  
  -- Check if bank account exists and belongs to user
  SELECT * INTO bank_account_record
  FROM bank_accounts
  WHERE id = p_bank_account_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bank account not found or does not belong to user';
  END IF;
  
  -- Check if bank account is active
  IF bank_account_record.status != 'active' THEN
    RAISE EXCEPTION 'Bank account is not active';
  END IF;
  
  -- Insert bank transaction
  INSERT INTO bank_transactions (
    user_id,
    bank_account_id,
    transaction_type,
    amount,
    currency,
    reference_number,
    description
  ) VALUES (
    p_user_id,
    p_bank_account_id,
    p_transaction_type,
    p_amount,
    p_currency,
    p_reference_number,
    p_description
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Function to get user bank accounts
CREATE OR REPLACE FUNCTION get_user_bank_accounts(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'accounts', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', ba.id,
        'account_name', ba.account_name,
        'account_number', ba.account_number,
        'bank_name', ba.bank_name,
        'bank_code', ba.bank_code,
        'iban', ba.iban,
        'swift_bic', ba.swift_bic,
        'account_type', ba.account_type,
        'currency', ba.currency,
        'is_primary', ba.is_primary,
        'is_verified', ba.is_verified,
        'status', ba.status,
        'created_at', ba.created_at
      ))
      FROM bank_accounts ba
      WHERE ba.user_id = p_user_id
      ORDER BY ba.is_primary DESC, ba.created_at DESC
    ),
    'transactions', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', bt.id,
        'transaction_type', bt.transaction_type,
        'amount', bt.amount,
        'currency', bt.currency,
        'status', bt.status,
        'reference_number', bt.reference_number,
        'description', bt.description,
        'transaction_date', bt.transaction_date,
        'completed_date', bt.completed_date
      ))
      FROM bank_transactions bt
      WHERE bt.user_id = p_user_id
      ORDER BY bt.transaction_date DESC
      LIMIT 10
    ),
    'payment_methods', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', pm.id,
        'method_type', pm.method_type,
        'provider', pm.provider,
        'account_number', pm.account_number,
        'is_default', pm.is_default,
        'status', pm.status
      ))
      FROM payment_methods pm
      WHERE pm.user_id = p_user_id
      ORDER BY pm.is_default DESC, pm.created_at DESC
    )
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_bank_account TO authenticated;
GRANT EXECUTE ON FUNCTION process_bank_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_bank_accounts TO authenticated;