import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { HeroSlide } from '../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../ImageUpload';

interface EditHeroSlideFormProps {
  slide: HeroSlide;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditHeroSlideForm: React.FC<EditHeroSlideFormProps> = ({ slide, onSuccess, onCancel }) => {
  const [title, setTitle] = useState(slide.title);
  const [description, setDescription] = useState(slide.description || '');
  const [imageUrl, setImageUrl] = useState(slide.image_url);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !imageUrl) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl
        })
        .eq('id', slide.id);

      if (error) throw error;

      toast.success('Slide atualizado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error updating slide:', error);
      toast.error('Erro ao atualizar slide');
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
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Slide</label>
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

export default EditHeroSlideForm;