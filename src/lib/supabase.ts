import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://only-daymonds-db-onlydiamonds.uvam34.easypanel.host';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getPublicUrl = (bucket: string, path: string | null): string | null => {
  if (!path) return null;
  
  // Ensure the path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the complete URL using the storage API endpoint
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
};