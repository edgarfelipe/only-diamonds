export interface Brand {
  id: number;
  name: string;
  logo_url: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  images: string[];
  brand_id: number;
  category_id: number;
  is_featured: boolean;
  created_at: string;
  brand?: Brand;
  category?: Category;
}

export interface HeroSlide {
  id: number;
  image_url: string;
  title: string;
  description: string;
  created_at: string;
}

export interface PersonalShopper {
  id: number;
  image_url: string;
  title: string;
  description1: string;
  description2: string;
  description3: string;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  show_hero_slides: boolean;
  show_featured_products: boolean;
  show_brands: boolean;
  show_categories: boolean;
  show_all_products: boolean;
  show_personal_shopper: boolean;
  brands_title: string;
  categories_title: string;
  featured_products_title: string;
  created_at: string;
  updated_at: string;
}