import { supabase } from '../supabase';

export const createTables = async () => {
  try {
    const { error } = await supabase.sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id BIGSERIAL PRIMARY KEY,
        show_hero_slides BOOLEAN DEFAULT true,
        show_featured_products BOOLEAN DEFAULT true,
        show_brands BOOLEAN DEFAULT true,
        show_categories BOOLEAN DEFAULT true,
        show_all_products BOOLEAN DEFAULT true,
        show_personal_shopper BOOLEAN DEFAULT true,
        brands_title TEXT DEFAULT 'Marcas que Trabalhamos',
        categories_title TEXT DEFAULT 'Categorias',
        featured_products_title TEXT DEFAULT 'Produtos em Destaque',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS brands (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        images TEXT[] DEFAULT '{}',
        brand_id BIGINT REFERENCES brands(id) ON DELETE CASCADE,
        category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hero_slides (
        id BIGSERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS personal_shopper (
        id BIGSERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        title TEXT NOT NULL,
        description1 TEXT NOT NULL,
        description2 TEXT NOT NULL,
        description3 TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;

    if (error) {
      console.error('Error in createTables:', error);
      return error;
    }

    return null;
  } catch (error) {
    console.error('Error in createTables:', error);
    return error;
  }
};