/*
  # Create Stripe Payments Table

  1. New Tables
    - `stripe_payments` - Stores Stripe payment information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `payment_intent_id` (text, Stripe payment intent ID)
      - `checkout_session_id` (text, optional Stripe checkout session ID)
      - `amount` (numeric, payment amount)
      - `currency` (text, payment currency)
      - `status` (text, payment status)
      - `token_amount` (numeric, calculated token amount)
      - `metadata` (jsonb, additional payment metadata)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `completed_at` (timestamptz, optional)

  2. Security
    - Enable RLS on the table
    - Add policies for users to view their own payments
    - Add policies for service role to manage all payments

  3. Indexes
    - Index on user_id for efficient queries
    - Index on payment_intent_id for Stripe webhook processing
    - Index on status for filtering by payment status
*/

-- Create stripe_payments table
CREATE TABLE IF NOT EXISTS stripe_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_intent_id text NOT NULL UNIQUE,
  checkout_session_id text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  token_amount numeric NOT NULL,
  payment_method_details jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_payments_user_id ON stripe_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_payment_intent_id ON stripe_payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON stripe_payments(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_created_at ON stripe_payments(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_stripe_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_stripe_payments_updated_at ON stripe_payments;
CREATE TRIGGER update_stripe_payments_updated_at
  BEFORE UPDATE ON stripe_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_payments_updated_at();

-- RLS Policies for stripe_payments
CREATE POLICY "Users can view their own stripe payments"
  ON stripe_payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all stripe payments"
  ON stripe_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to record a Stripe payment
CREATE OR REPLACE FUNCTION record_stripe_payment(
  p_user_id uuid,
  p_payment_intent_id text,
  p_checkout_session_id text DEFAULT NULL,
  p_amount numeric,
  p_currency text DEFAULT 'eur',
  p_token_amount numeric DEFAULT NULL,
  p_payment_method_details jsonb DEFAULT '{}'::jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_id uuid;
  calculated_token_amount numeric;
BEGIN
  -- Validate required fields
  IF p_user_id IS NULL OR p_payment_intent_id IS NULL OR p_amount IS NULL THEN
    RAISE EXCEPTION 'Missing required fields';
  END IF;
  
  -- Calculate token amount if not provided (1 EUR = 2/3 DRONE token)
  IF p_token_amount IS NULL THEN
    calculated_token_amount := floor(p_amount / 1.5);
  ELSE
    calculated_token_amount := p_token_amount;
  END IF;
  
  -- Insert payment record
  INSERT INTO stripe_payments (
    user_id,
    payment_intent_id,
    checkout_session_id,
    amount,
    currency,
    token_amount,
    payment_method_details,
    metadata
  ) VALUES (
    p_user_id,
    p_payment_intent_id,
    p_checkout_session_id,
    p_amount,
    p_currency,
    calculated_token_amount,
    p_payment_method_details,
    p_metadata
  ) RETURNING id INTO payment_id;
  
  -- Update user investment and token balance
  PERFORM update_user_investment(
    p_user_id,
    p_amount,
    calculated_token_amount
  );
  
  RETURN payment_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to record Stripe payment: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION record_stripe_payment TO service_role;