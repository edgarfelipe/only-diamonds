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
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    headers: {
      'x-my-custom-header': 'only-diamonds'
    }
  }
});

// Helper function to get public URL for files
export const getPublicUrl = (bucket: string, path: string | null): string | null => {
  if (!path) return null;
  
  // Ensure the path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the complete URL using the storage API endpoint
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
};

// Helper function to handle file uploads
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string> => {
  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true // Changed to true to allow overwriting
      });

    if (uploadError) throw uploadError;

    return path;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Helper function to delete files
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};