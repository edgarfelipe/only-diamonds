import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category, Brand, SiteSettings } from '../types';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import BrandsList from '../components/BrandsList';
import HeroSlider from '../components/HeroSlider';
import ProductModal from '../components/ProductModal';
import toast from 'react-hot-toast';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch site settings first
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Settings error:', settingsError);
        throw new Error('Erro ao carregar configurações do site');
      }

      setSettings(settingsData || {
        show_hero_slides: true,
        show_featured_products: true,
        show_brands: true,
        show_categories: true,
        show_all_products: true,
        show_personal_shopper: true,
        brands_title: 'Marcas que Trabalhamos',
        categories_title: 'Categorias',
        featured_products_title: 'Produtos em Destaque'
      });

      // Fetch other data in parallel
      const [categoriesRes, brandsRes, featuredRes, productsRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('brands').select('*').order('created_at', { ascending: true }),
        supabase.from('products')
          .select('*, brand:brands(*), category:categories(*)')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('products')
          .select('*, brand:brands(*), category:categories(*)')
          .order('created_at', { ascending: false })
          .limit(6)
      ]);

      // Check for errors
      if (categoriesRes.error) {
        console.error('Categories error:', categoriesRes.error);
        throw new Error('Erro ao carregar categorias');
      }
      if (brandsRes.error) {
        console.error('Brands error:', brandsRes.error);
        throw new Error('Erro ao carregar marcas');
      }
      if (featuredRes.error) {
        console.error('Featured products error:', featuredRes.error);
        throw new Error('Erro ao carregar produtos em destaque');
      }
      if (productsRes.error) {
        console.error('Products error:', productsRes.error);
        throw new Error('Erro ao carregar produtos');
      }

      // Update state with fetched data
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
      setFeaturedProducts(featuredRes.data || []);
      setProducts(productsRes.data || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Erro ao carregar dados');
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = async (category: Category) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, brand:brands(*), category:categories(*)')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setModalProducts(data || []);
      setModalTitle(`Produtos da categoria ${category.name}`);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching category products:', error);
      toast.error('Erro ao carregar produtos da categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandClick = async (brandId: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, brand:brands(*), category:categories(*)')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setModalProducts(data || []);
      const brand = brands.find(b => b.id === brandId);
      setModalTitle(`Produtos da marca ${brand?.name}`);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching brand products:', error);
      toast.error('Erro ao carregar produtos da marca');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setModalProducts([product]);
    setModalTitle('Produto');
    setIsModalOpen(true);
  };

  const handleWhatsAppClick = (product: Product) => {
    const message = `Olá! Gostaria de saber mais sobre o produto: ${product.name}`;
    const whatsappNumber = "351961217829";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchData()} 
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-24">
      {/* Hero Slider */}
      {settings?.show_hero_slides && <HeroSlider />}

      {/* Featured Products Section */}
      {settings?.show_featured_products && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              {settings.featured_products_title}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
                onWhatsAppClick={handleWhatsAppClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Brands Section */}
      {settings?.show_brands && brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              {settings.brands_title}
            </h2>
          </div>
          <BrandsList brands={brands} onBrandClick={handleBrandClick} />
        </section>
      )}

      {/* Categories Section */}
      {settings?.show_categories && categories.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-light mb-4">
                {settings.categories_title}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={handleCategoryClick}
                  isSelected={selectedCategory === category.id}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      {settings?.show_all_products && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-12 md:mb-24">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-light">Todos os Produtos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
                onWhatsAppClick={handleWhatsAppClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Product Modal */}
      <ProductModal
        products={modalProducts}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      />

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/351961217829"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 md:bottom-8 right-4 md:right-8 bg-green-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 z-50"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </a>
    </div>
  );
};

export default Home;