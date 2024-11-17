import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, LayoutGrid, Tags, BookOpen, Presentation, UserCircle, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deleteImage } from '../lib/storage';
import { Product, Brand, Category, HeroSlide, PersonalShopper, SiteSettings } from '../types';
import BrandForm from '../components/AdminForms/BrandForm';
import EditBrandForm from '../components/AdminForms/EditBrandForm';
import CategoryForm from '../components/AdminForms/CategoryForm';
import EditCategoryForm from '../components/AdminForms/EditCategoryForm';
import ProductForm from '../components/AdminForms/ProductForm';
import EditProductForm from '../components/AdminForms/EditProductForm';
import HeroSlideForm from '../components/AdminForms/HeroSlideForm';
import EditHeroSlideForm from '../components/AdminForms/EditHeroSlideForm';
import PersonalShopperForm from '../components/AdminForms/PersonalShopperForm';
import SiteSettingsForm from '../components/AdminForms/SiteSettingsForm';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('brands');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [personalShopper, setPersonalShopper] = useState<PersonalShopper | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'brands', name: 'Marcas', icon: Tags },
    { id: 'categories', name: 'Categorias', icon: LayoutGrid },
    { id: 'products', name: 'Produtos', icon: BookOpen },
    { id: 'slides', name: 'Slides', icon: Presentation },
    { id: 'personal_shopper', name: 'Personal Shopper', icon: UserCircle },
    { id: 'settings', name: 'Configurações', icon: Settings },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'brands':
          const { data: brandsData, error: brandsError } = await supabase
            .from('brands')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (brandsError) throw brandsError;
          setBrands(brandsData || []);
          break;

        case 'categories':
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (categoriesError) throw categoriesError;
          setCategories(categoriesData || []);
          break;

        case 'products':
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*, brand:brands(*), category:categories(*)')
            .order('created_at', { ascending: false });
          
          if (productsError) throw productsError;
          setProducts(productsData || []);
          break;

        case 'slides':
          const { data: slidesData, error: slidesError } = await supabase
            .from('hero_slides')
            .select('*')
            .order('created_at', { ascending: true });
          
          if (slidesError) throw slidesError;
          setSlides(slidesData || []);
          break;

        case 'personal_shopper':
          const { data: shopperData, error: shopperError } = await supabase
            .from('personal_shopper')
            .select('*')
            .single();
          
          if (shopperError && shopperError.code !== 'PGRST116') throw shopperError;
          setPersonalShopper(shopperData);
          break;

        case 'settings':
          const { data: settingsData, error: settingsError } = await supabase
            .from('site_settings')
            .select('*')
            .single();
          
          if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
          setSiteSettings(settingsData);
          break;
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isDeleting) return;
    
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    setIsDeleting(true);
    
    try {
      let table = '';
      let itemToDelete = null;

      switch (activeTab) {
        case 'brands':
          table = 'brands';
          itemToDelete = brands.find(b => b.id === id);
          break;
        case 'categories':
          table = 'categories';
          itemToDelete = categories.find(c => c.id === id);
          break;
        case 'products':
          table = 'products';
          itemToDelete = products.find(p => p.id === id);
          break;
        case 'slides':
          table = 'hero_slides';
          itemToDelete = slides.find(s => s.id === id);
          break;
      }

      if (!table || !itemToDelete) {
        throw new Error('Item não encontrado');
      }

      // Delete from database first
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // If it's a product, delete associated images after successful database deletion
      if (activeTab === 'products' && !deleteError) {
        const product = itemToDelete as Product;
        if (product.images) {
          await Promise.all(
            product.images.map(async (imageUrl) => {
              const path = imageUrl.split('/').pop();
              if (path) {
                await deleteImage(`products/${path}`);
              }
            })
          );
        }
      }

      // Update local state immediately
      switch (activeTab) {
        case 'brands':
          setBrands(prev => prev.filter(b => b.id !== id));
          break;
        case 'categories':
          setCategories(prev => prev.filter(c => c.id !== id));
          break;
        case 'products':
          setProducts(prev => prev.filter(p => p.id !== id));
          break;
        case 'slides':
          setSlides(prev => prev.filter(s => s.id !== id));
          break;
      }

      toast.success('Item excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir item');
      // Refresh data in case of error
      await fetchData();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    setEditingBrand(null);
    setEditingCategory(null);
    setEditingSlide(null);
    fetchData();
  };

  const handleEdit = (item: Product | Brand | Category | HeroSlide, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (activeTab) {
      case 'products':
        setEditingProduct(item as Product);
        break;
      case 'brands':
        setEditingBrand(item as Brand);
        break;
      case 'categories':
        setEditingCategory(item as Category);
        break;
      case 'slides':
        setEditingSlide(item as HeroSlide);
        break;
    }
    setShowForm(true);
  };

  const renderForm = () => {
    if (!showForm) return null;

    switch (activeTab) {
      case 'products':
        return editingProduct ? (
          <EditProductForm
            product={editingProduct}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <ProductForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        );
      case 'brands':
        return editingBrand ? (
          <EditBrandForm
            brand={editingBrand}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <BrandForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        );
      case 'categories':
        return editingCategory ? (
          <EditCategoryForm
            category={editingCategory}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <CategoryForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        );
      case 'slides':
        return editingSlide ? (
          <EditHeroSlideForm
            slide={editingSlide}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <HeroSlideForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        );
      case 'personal_shopper':
        return (
          <PersonalShopperForm
            personalShopper={personalShopper}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="mt-2 text-sm text-gray-600">Gerencie seus produtos, marcas, categorias e configurações</p>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === id 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 transform scale-[1.02]' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Gerenciar {
                activeTab === 'brands' ? 'Marcas' : 
                activeTab === 'categories' ? 'Categorias' : 
                activeTab === 'slides' ? 'Slides' : 
                activeTab === 'personal_shopper' ? 'Personal Shopper' :
                activeTab === 'settings' ? 'Configurações' :
                'Produtos'
              }
            </h2>
            {activeTab !== 'settings' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setEditingBrand(null);
                  setEditingCategory(null);
                  setEditingSlide(null);
                  setShowForm(true);
                }}
                className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-orange-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar {
                  activeTab === 'brands' ? 'Marca' : 
                  activeTab === 'categories' ? 'Categoria' : 
                  activeTab === 'slides' ? 'Slide' : 
                  activeTab === 'personal_shopper' ? 'Personal Shopper' :
                  'Produto'
                }
              </button>
            )}
          </div>

          {/* Form or Content */}
          {showForm ? (
            renderForm()
          ) : (
            <>
              {/* Settings Section */}
              {activeTab === 'settings' && siteSettings && (
                <div className="bg-white rounded-xl">
                  <SiteSettingsForm
                    settings={siteSettings}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              )}

              {/* Personal Shopper Section */}
              {activeTab === 'personal_shopper' && (
                <div className="bg-white rounded-xl">
                  {personalShopper ? (
                    <PersonalShopperForm
                      personalShopper={personalShopper}
                      onSuccess={handleFormSuccess}
                      onCancel={() => setShowForm(false)}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Nenhuma informação de Personal Shopper encontrada.</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Personal Shopper
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Other Sections Grid */}
              {activeTab !== 'settings' && activeTab !== 'personal_shopper' && (
                <div className={`grid ${activeTab === 'products' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
                  {/* Brands Grid */}
                  {activeTab === 'brands' && brands.map((brand) => (
                    <div key={brand.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEdit(brand, e)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(brand.id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            disabled={isDeleting}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="mt-4 font-medium text-gray-900">{brand.name}</h3>
                    </div>
                  ))}

                  {/* Categories Grid */}
                  {activeTab === 'categories' && categories.map((category) => (
                    <div key={category.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEdit(category, e)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(category.id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            disabled={isDeleting}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="mt-4 font-medium text-gray-900">{category.name}</h3>
                    </div>
                  ))}

                  {/* Products Grid */}
                  {activeTab === 'products' && products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={(e) => handleEdit(product, e)}
                            className="text-gray-600 hover:text-blue-500 bg-white rounded-full p-2 shadow-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(product.id, e)}
                            className="text-gray-600 hover:text-red-500 bg-white rounded-full p-2 shadow-lg transition-colors"
                            disabled={isDeleting}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-500">Marca: {product.brand?.name}</p>
                          <p className="text-sm text-gray-500">Categoria: {product.category?.name}</p>
                          {product.is_featured && (
                            <p className="text-sm font-medium text-orange-500">Em Destaque</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Slides Grid */}
                  {activeTab === 'slides' && slides.map((slide) => (
                    <div key={slide.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={(e) => handleEdit(slide, e)}
                            className="text-gray-600 hover:text-blue-500 bg-white rounded-full p-2 shadow-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(slide.id, e)}
                            className="text-gray-600 hover:text-red-500 bg-white rounded-full p-2 shadow-lg transition-colors"
                            disabled={isDeleting}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900">{slide.title}</h3>
                        {slide.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{slide.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;