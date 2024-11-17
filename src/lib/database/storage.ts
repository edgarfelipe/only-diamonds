import { SupabaseClient } from '@supabase/supabase-js';

export const setupStorage = async (supabase: SupabaseClient) => {
  try {
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return bucketsError;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'fotos_valeria');
    
    if (!bucketExists) {
      console.log('Creating storage bucket...');
      
      // Create bucket with retries
      let retries = 3;
      let createError;
      
      while (retries > 0) {
        try {
          const { error } = await supabase.storage.createBucket('fotos_valeria', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (!error) {
            createError = null;
            break;
          }
          
          createError = error;
        } catch (error) {
          createError = error;
        }
        
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between retries
        }
      }
      
      if (createError) {
        console.error('Error creating bucket after retries:', createError);
        return createError;
      }
    }

    // Set up storage policies
    try {
      await supabase.sql`
        DO $$ 
        BEGIN
          -- Enable RLS
          ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
          
          -- Create policies if they don't exist
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND policyname = 'Public Access'
          ) THEN
            CREATE POLICY "Public Access" 
              ON storage.objects FOR SELECT 
              USING (bucket_id = 'fotos_valeria');
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND policyname = 'Authenticated Upload'
          ) THEN
            CREATE POLICY "Authenticated Upload" 
              ON storage.objects FOR INSERT 
              WITH CHECK (bucket_id = 'fotos_valeria');
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND policyname = 'Authenticated Delete'
          ) THEN
            CREATE POLICY "Authenticated Delete" 
              ON storage.objects FOR DELETE 
              USING (bucket_id = 'fotos_valeria');
          END IF;
        END $$;
      `;
    } catch (error: any) {
      // Log but don't fail if policies already exist
      if (!error.message?.includes('already exists')) {
        console.error('Error setting up storage policies:', error);
      }
    }

    return null;
  } catch (error) {
    console.error('Error in setupStorage:', error);
    return error;
  }
};