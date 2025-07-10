import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-url') || supabaseAnonKey.includes('your-anon-key')) {
  const errorMessage = 'Supabase configuration error: Please update your .env file with actual Supabase credentials from your Supabase dashboard.';
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// Create Supabase client with custom settings
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'dronera-platform'
    }
  }
});

// Export types for better TypeScript integration
export type { User, Session } from '@supabase/supabase-js';