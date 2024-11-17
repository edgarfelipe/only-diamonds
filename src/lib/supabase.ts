import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
let validatedUrl: string;
try {
  const url = new URL(supabaseUrl);
  validatedUrl = url.toString();
} catch (error) {
  console.error('Invalid Supabase URL:', error);
  throw new Error('Invalid Supabase URL configuration');
}

export const supabase = createClient(validatedUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});