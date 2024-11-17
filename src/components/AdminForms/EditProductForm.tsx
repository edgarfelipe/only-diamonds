import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product, Brand, Category } from '../../types';
import toast from 'react-hot-toast';

interface EditProductFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [brandId, setBrandId] = useState(String(product.brand_id));
  const [categoryId, setCategoryId] = useState(String(product.category_id));
  const [imageUrls, setImageUrls] = useState<string[]>(product.images);
  const [isFeatured, setIsFeatured] = useState(product.is_featured);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  const fetchBrandsAndCategories = async () => {
    const [brandsData, categoriesData] = await Promise.all([
      supabase.from('brands').select('*'),
      supabase.from('categories').select('*')
    ]);

    if (brandsData.data) setBrands(brandsData.data);
    if (categoriesData.data) setCategories(categoriesData.data);
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !brandId || !categoryId || !imageUrls[0]) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          description,
          brand_id: brandId,
          category_id: categoryId,
          images: imageUrls.filter(url => url.trim() !== ''),
          is_featured: isFeatured
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      toast.success('Produto atualizado com sucesso!');
      onSuccess();
    } catch (error) {
      toast.error('Erro ao atualizar produto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Marca</label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            required
          >
            <option value="">Selecione uma marca</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URLs das Imagens</label>
        {imageUrls.map((url, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required={index === 0}
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeImageUrl(index)}
                className="px-2 py-1 text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addImageUrl}
          className="text-sm text-orange-600 hover:text-orange-800"
        >
          + Adicionar outra imagem
        </button>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isFeatured"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
          Produto em Destaque
        </label>
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

export default EditProductForm;