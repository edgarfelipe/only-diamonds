import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PersonalShopper } from '../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../ImageUpload';

interface PersonalShopperFormProps {
  personalShopper?: PersonalShopper;
  onSuccess: () => void;
  onCancel: () => void;
}

const PersonalShopperForm: React.FC<PersonalShopperFormProps> = ({
  personalShopper,
  onSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState(personalShopper?.title || '');
  const [description1, setDescription1] = useState(personalShopper?.description1 || '');
  const [description2, setDescription2] = useState(personalShopper?.description2 || '');
  const [description3, setDescription3] = useState(personalShopper?.description3 || '');
  const [imageUrl, setImageUrl] = useState(personalShopper?.image_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description1 || !description2 || !description3 || !imageUrl) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        description1: description1.trim(),
        description2: description2.trim(),
        description3: description3.trim(),
        image_url: imageUrl
      };

      let error;

      if (personalShopper) {
        // Update existing
        ({ error } = await supabase
          .from('personal_shopper')
          .update(data)
          .eq('id', personalShopper.id));
      } else {
        // Insert new
        ({ error } = await supabase
          .from('personal_shopper')
          .insert([data]));
      }

      if (error) throw error;

      toast.success(personalShopper ? 'Informações atualizadas com sucesso!' : 'Personal Shopper adicionado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error saving personal shopper:', error);
      toast.error('Erro ao salvar informações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição 1</label>
        <textarea
          value={description1}
          onChange={(e) => setDescription1(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
          placeholder="Como Personal Shopper, meu objetivo é transformar sua experiência de compra..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição 2</label>
        <textarea
          value={description2}
          onChange={(e) => setDescription2(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
          placeholder="Desde a seleção de peças exclusivas até a criação de looks completos..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição 3</label>
        <textarea
          value={description3}
          onChange={(e) => setDescription3(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          required
          placeholder="Entre em contato e permita-me tornar suas compras uma experiência..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Fundo</label>
        <ImageUpload
          type="slide"
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

export default PersonalShopperForm;