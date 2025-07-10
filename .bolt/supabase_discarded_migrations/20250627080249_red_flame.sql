/*
  # Fix RLS policy for didit_api_logs table

  1. Security Updates
    - Add policy for anonymous users to insert API logs
    - This allows client-side logging while maintaining security
    - Only INSERT operations are allowed for anonymous users
*/

-- Allow anonymous users to insert API logs
CREATE POLICY "Anonymous users can insert API logs"
  ON didit_api_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert API logs  
CREATE POLICY "Authenticated users can insert API logs"
  ON didit_api_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);