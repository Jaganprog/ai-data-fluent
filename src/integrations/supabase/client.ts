import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://amiygmhgdjcuughnxlkg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaXlnbWhnZGpjdXVnaG54bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTgzMzcsImV4cCI6MjA3MjYzNDMzN30.T4EnxmQR9fOUxtL-K4MaubMAUnM0TYWNvbxnndiozuw";

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export auth helpers
export const auth = supabase.auth;
export const db = supabase;