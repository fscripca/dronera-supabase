/*
  # Fix Policy Conflicts for API Logs

  1. Changes
    - Drop existing policies for didit_api_logs table
    - Ensure clean policy creation to avoid conflicts
    - Maintain all existing functionality

  2. Security
    - Preserve security model
    - Ensure proper access control
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage API logs" ON didit_api_logs;
DROP POLICY IF EXISTS "Anonymous users can insert API logs" ON didit_api_logs;
DROP POLICY IF EXISTS "Authenticated users can insert API logs" ON didit_api_logs;

-- Recreate policies with IF NOT EXISTS to prevent future conflicts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'didit_api_logs' AND policyname = 'Service role can manage API logs'
  ) THEN
    CREATE POLICY "Service role can manage API logs"
      ON didit_api_logs
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'didit_api_logs' AND policyname = 'Anonymous users can insert API logs'
  ) THEN
    CREATE POLICY "Anonymous users can insert API logs"
      ON didit_api_logs
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'didit_api_logs' AND policyname = 'Authenticated users can insert API logs'
  ) THEN
    CREATE POLICY "Authenticated users can insert API logs"
      ON didit_api_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END
$$;