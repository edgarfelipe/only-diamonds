import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import ImageUpload from '../ImageUpload';

interface BrandFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BrandForm: React.FC<BrandFormProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, insira o nome da marca');
      return;
    }

    if (!logoUrl) {
      toast.error('Por favor, faça upload do logo da marca');
      return;
    }

    if (isUploading) {
      toast.error('Aguarde o upload da imagem terminar');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('brands')
        .insert({
          name: name.trim(),
          logo_url: logoUrl
        });

      if (error) {
        throw error;
      }

      toast.success('Marca adicionada com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Error adding brand:', error);
      toast.error(error.message || 'Erro ao adicionar marca');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setLogoUrl(url);
    setIsUploading(false);
  };

  const handleImageUploadStart = () => {
    setIsUploading(true);
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
          onUpload={handleImageUpload}
          onUploadStart={handleImageUploadStart}
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
          disabled={loading || isUploading}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : isUploading ? 'Aguarde o upload...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default BrandForm;