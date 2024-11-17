import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: localStorage
  }
});

// Safe URL construction
export const getPublicUrl = (bucket: string, path: string | null): string | null => {
  if (!path || !supabaseUrl) return null;
  try {
    // Ensure path is properly formatted
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(`${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`);
    return url.toString();
  } catch (error) {
    console.error('Error constructing URL:', error);
    return null;
  }
};

export const uploadFile = async (
  bucket: string,
  userId: string,
  file: File,
  type: 'photo' | 'video' | 'document'
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${type}s/${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;
    return filePath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
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

export const updateUserFiles = async (
  userId: string,
  field: 'foto_perfil' | 'fotos' | 'videos' | 'documento',
  paths: string | string[]
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ [field]: paths })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user files:', error);
    throw error;
  }
};