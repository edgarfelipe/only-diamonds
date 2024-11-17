import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SiteSettings } from '../../types';
import toast from 'react-hot-toast';

interface SiteSettingsFormProps {
  settings: SiteSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

const SiteSettingsForm: React.FC<SiteSettingsFormProps> = ({
  settings,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    show_hero_slides: settings.show_hero_slides,
    show_featured_products: settings.show_featured_products,
    show_brands: settings.show_brands,
    show_categories: settings.show_categories,
    show_all_products: settings.show_all_products,
    show_personal_shopper: settings.show_personal_shopper,
    brands_title: settings.brands_title,
    categories_title: settings.categories_title,
    featured_products_title: settings.featured_products_title
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast.success('Configurações atualizadas com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Visibilidade das Seções</h3>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="show_hero_slides"
              checked={formData.show_hero_slides}
              onChange={handleChange}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mostrar Slides</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="show_featured_products"
              checked={formData.show_featured_products}
              onChange={handleChange}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mostrar Produtos em Destaque</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="show_brands"
              checked={formData.show_brands}
              onChange={handleChange}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mostrar Seção de Marcas</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="show_categories"
              checked={formData.show_categories}
              onChange={handleChange}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mostrar Seção de Categorias</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="show_all_products"
              checked={formData.show_all_products}
              onChange={handleChange}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mostrar Todos os Produtos</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="show_personal_shopper"
              checked={formData.show_personal_shopper}
              onChange={handleChange}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Mostrar Seção Personal Shopper</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Títulos das Seções</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título da Seção de Produtos em Destaque
          </label>
          <input
            type="text"
            name="featured_products_title"
            value={formData.featured_products_title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título da Seção de Marcas
          </label>
          <input
            type="text"
            name="brands_title"
            value={formData.brands_title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título da Seção de Categorias
          </label>
          <input
            type="text"
            name="categories_title"
            value={formData.categories_title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default SiteSettingsForm;