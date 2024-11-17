import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../ImageUpload';

interface EditCategoryFormProps {
  category: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditCategoryForm: React.FC<EditCategoryFormProps> = ({ category, onSuccess, onCancel }) => {
  const [name, setName] = useState(category.name);
  const [imageUrl, setImageUrl] = useState(category.image_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          name, 
          image_url: imageUrl 
        })
        .eq('id', category.id);

      if (error) throw error;

      toast.success('Categoria atualizada com sucesso!');
      onSuccess();
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem da Categoria</label>
        <ImageUpload
          type="category"
          onUpload={setImageUrl}
          existingUrl={imageUrl}
          className="w-full"
        />
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

export default EditCategoryForm;