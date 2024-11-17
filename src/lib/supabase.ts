import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-my-custom-header': 'only-diamonds'
    }
  }
});

export const getPublicUrl = (bucket: string, path: string | null): string | null => {
  if (!path) return null;
  
  // Ensure the path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the complete URL using the storage API endpoint
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
};