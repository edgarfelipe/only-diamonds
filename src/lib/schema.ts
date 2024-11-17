import { supabase } from './supabase';

export async function initializeSchema() {
  try {
    // Check if schema is initialized by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Schema check failed:', error);
      return false;
    }

    console.log('Schema check completed');
    return true;
  } catch (error) {
    console.error('Error checking schema:', error);
    return false;
  }
}