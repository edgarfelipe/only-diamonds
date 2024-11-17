import { SupabaseClient } from '@supabase/supabase-js';

export const initializeSettings = async (supabase: SupabaseClient) => {
  try {
    // Check if settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('site_settings')
      .select('id')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking settings:', checkError);
      throw checkError;
    }

    // Only create settings if they don't exist
    if (!existingSettings) {
      console.log('Creating default settings...');
      
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert([{
          show_hero_slides: true,
          show_featured_products: true,
          show_brands: true,
          show_categories: true,
          show_all_products: true,
          show_personal_shopper: true,
          brands_title: 'Marcas que Trabalhamos',
          categories_title: 'Categorias',
          featured_products_title: 'Produtos em Destaque'
        }]);

      if (insertError) {
        console.error('Error inserting default settings:', insertError);
        throw insertError;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in initializeSettings:', error);
    return error;
  }
};