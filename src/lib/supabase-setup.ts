import { supabase } from './supabase';
import { createTables } from './database/tables';
import { setupStorage } from './database/storage';
import { initializeSettings } from './database/settings';
import toast from 'react-hot-toast';

export async function setupDatabase() {
  try {
    // Test connection first
    const { error: testError } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1);

    // If table doesn't exist, create all tables
    if (testError?.code === 'PGRST116') {
      console.log('Creating database schema...');
      
      // Create tables
      const tablesError = await createTables();
      if (tablesError) {
        console.error('Error creating tables:', tablesError);
        throw tablesError;
      }

      // Initialize settings
      const settingsError = await initializeSettings(supabase);
      if (settingsError) {
        console.error('Error initializing settings:', settingsError);
        throw settingsError;
      }
    } else if (testError) {
      console.error('Database connection error:', testError);
      throw new Error('Failed to connect to database');
    }

    // Setup storage (always run to ensure bucket exists)
    const storageError = await setupStorage(supabase);
    if (storageError) {
      // Log but continue if storage setup fails
      console.error('Storage setup error:', storageError);
    }

    console.log('Database setup completed successfully');
    return null;
  } catch (error: any) {
    console.error('Database setup error:', error);
    toast.error('Erro ao configurar o banco de dados. Por favor, tente novamente.');
    return error;
  }
}