/*
  # Fix Ambiguous Column References in Database Functions

  1. Function Updates
    - Fix `get_profit_sharing_metrics` function to properly qualify column references
    - Add proper table aliases to avoid ambiguous column references
    - Create supporting functions for dashboard statistics
    - Ensure all functions have proper error handling

  2. New Functions
    - `get_user_statistics` - Provides user-related metrics for the admin dashboard
    - `get_whitelist_statistics` - Provides whitelist-related metrics
    - `get_token_metrics` - Provides token-related metrics
*/

-- Drop all existing functions first to avoid return type errors
DROP FUNCTION IF EXISTS get_profit_sharing_metrics();
DROP FUNCTION IF EXISTS get_user_statistics();
DROP FUNCTION IF EXISTS get_whitelist_statistics();
DROP FUNCTION IF EXISTS get_token_metrics();

-- Create the corrected function with proper column qualifications
CREATE OR REPLACE FUNCTION get_profit_sharing_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    total_distributed_amount NUMERIC := 0;
    total_allocated_amount NUMERIC := 0;
    next_distribution_info jsonb;
    active_pools_count INTEGER := 0;
    total_participants_count INTEGER := 0;
BEGIN
    -- Get total distributed amount from completed distributions
    SELECT COALESCE(SUM(pd.amount), 0)
    INTO total_distributed_amount
    FROM profit_distributions pd
    WHERE pd.status = 'completed';

    -- Get total allocated amount from profit pools
    SELECT COALESCE(SUM(pp.allocated_amount), 0)
    INTO total_allocated_amount
    FROM profit_pools pp
    WHERE pp.status = 'active';

    -- Get count of active profit pools
    SELECT COUNT(*)
    INTO active_pools_count
    FROM profit_pools pp
    WHERE pp.status = 'active';

    -- Get total count of active profit participants
    SELECT COUNT(*)
    INTO total_participants_count
    FROM profit_participants pp
    WHERE pp.status = 'active';

    -- Get next scheduled distribution
    SELECT jsonb_build_object(
        'id', pd.id,
        'amount', pd.amount,
        'date', pd.distribution_date,
        'status', pd.status,
        'participant_count', pd.participant_count
    )
    INTO next_distribution_info
    FROM profit_distributions pd
    WHERE pd.status = 'scheduled'
    AND pd.distribution_date > NOW()
    ORDER BY pd.distribution_date ASC
    LIMIT 1;

    -- Build the result JSON
    result := jsonb_build_object(
        'total_distributed', total_distributed_amount,
        'total_allocated', total_allocated_amount,
        'active_pools_count', active_pools_count,
        'total_participants', total_participants_count,
        'next_distribution', next_distribution_info
    );

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return default values on error
        RETURN jsonb_build_object(
            'total_distributed', 0,
            'total_allocated', 0,
            'active_pools_count', 0,
            'total_participants', 0,
            'next_distribution', NULL,
            'error', SQLERRM
        );
END;
$$;

-- Create supporting functions for dashboard statistics
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    total_users_count INTEGER := 0;
    kyc_pending_count INTEGER := 0;
    kyc_approved_count INTEGER := 0;
    new_users_week_count INTEGER := 0;
BEGIN
    -- Get total users count
    SELECT COUNT(*)
    INTO total_users_count
    FROM profiles p;

    -- Get KYC pending count
    SELECT COUNT(*)
    INTO kyc_pending_count
    FROM profiles p
    WHERE p.kyc_status = 'pending';

    -- Get KYC approved count
    SELECT COUNT(*)
    INTO kyc_approved_count
    FROM profiles p
    WHERE p.kyc_status = 'approved';

    -- Get new users this week
    SELECT COUNT(*)
    INTO new_users_week_count
    FROM profiles p
    WHERE p.created_at >= NOW() - INTERVAL '7 days';

    -- Build result
    result := jsonb_build_object(
        'total_users', total_users_count,
        'kyc_pending', kyc_pending_count,
        'kyc_approved', kyc_approved_count,
        'new_users_week', new_users_week_count
    );

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'total_users', 0,
            'kyc_pending', 0,
            'kyc_approved', 0,
            'new_users_week', 0,
            'error', SQLERRM
        );
END;
$$;

CREATE OR REPLACE FUNCTION get_whitelist_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    active_entries_count INTEGER := 0;
    total_entries_count INTEGER := 0;
    pending_entries_count INTEGER := 0;
BEGIN
    -- Get active whitelist entries
    SELECT COUNT(*)
    INTO active_entries_count
    FROM whitelist_entries we
    WHERE we.status = 'active';

    -- Get total whitelist entries
    SELECT COUNT(*)
    INTO total_entries_count
    FROM whitelist_entries we;

    -- Get pending whitelist entries
    SELECT COUNT(*)
    INTO pending_entries_count
    FROM whitelist_entries we
    WHERE we.status = 'pending';

    -- Build result
    result := jsonb_build_object(
        'active_entries', active_entries_count,
        'total_entries', total_entries_count,
        'pending_entries', pending_entries_count
    );

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'active_entries', 0,
            'total_entries', 0,
            'pending_entries', 0,
            'error', SQLERRM
        );
END;
$$;

CREATE OR REPLACE FUNCTION get_token_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    holders_count_val INTEGER := 0;
    total_supply_val NUMERIC := 0;
    circulating_supply_val NUMERIC := 0;
BEGIN
    -- Get token holders count
    SELECT COUNT(*)
    INTO holders_count_val
    FROM token_holders th
    WHERE th.balance > 0;

    -- Get total supply from configuration
    SELECT COALESCE(tc.max_supply, 100000000)
    INTO total_supply_val
    FROM token_configurations tc
    ORDER BY tc.created_at DESC
    LIMIT 1;

    -- Get circulating supply (sum of all holder balances)
    SELECT COALESCE(SUM(th.balance), 0)
    INTO circulating_supply_val
    FROM token_holders th;

    -- Build result
    result := jsonb_build_object(
        'holders_count', holders_count_val,
        'total_supply', total_supply_val,
        'circulating_supply', circulating_supply_val
    );

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'holders_count', 0,
            'total_supply', 100000000,
            'circulating_supply', 0,
            'error', SQLERRM
        );
END;
$$;