/*
  # Create token metrics function

  1. New Functions
    - `get_token_metrics()` - Returns token metrics data including total supply, distributed amount, and holder count
  
  2. Security
    - Function is accessible to authenticated users
    - Returns mock data for demonstration purposes
*/

-- Create the get_token_metrics function
CREATE OR REPLACE FUNCTION get_token_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Return mock token metrics data
  -- In a real implementation, this would query actual token data from your tables
  SELECT json_build_object(
    'total_supply', 100000000,
    'total_distributed', 15000,
    'holders_count', 3,
    'current_price', 1.0,
    'market_cap', 100000000,
    'last_updated', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;