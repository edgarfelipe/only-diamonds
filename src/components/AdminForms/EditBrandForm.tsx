import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Brand } from '../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../ImageUpload';

interface EditBrandFormProps {
  brand: Brand;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditBrandForm: React.FC<EditBrandFormProps> = ({ brand, onSuccess, onCancel }) => {
  const [name, setName] = useState(brand.name);
  const [logoUrl, setLogoUrl] = useState(brand.logo_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !logoUrl) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({
          name: name.trim(),
          logo_url: logoUrl
        })
        .eq('id', brand.id);

      if (error) throw error;

      toast.success('Marca atualizada com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating brand:', error);
      toast.error(error.message || 'Erro ao atualizar marca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome da Marca</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo da Marca</label>
        <ImageUpload
          type="brand"
          onUpload={setLogoUrl}
          existingUrl={logoUrl}
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

export default EditBrandForm;