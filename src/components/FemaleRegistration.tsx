import React, { useState } from 'react';
import { Camera, Upload, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/supabase';
import { hashPassword } from '../utils/hash';
import { useAuthStore } from '../store/authStore';
import { useStore } from '../store/appStore';
import toast from 'react-hot-toast';

interface FemaleRegistrationProps {
  onBack: () => void;
}

interface RegistrationForm {
  nome: string;
  email: string;
  senha: string;
  idade: string;
  whatsapp: string;
  localizacao: string;
  bio: string;
  altura: string;
  medidas: string;
  atende: string;
  horario: string;
  idiomas: string[];
}

const initialForm: RegistrationForm = {
  nome: '',
  email: '',
  senha: '',
  idade: '',
  whatsapp: '',
  localizacao: '',
  bio: '',
  altura: '',
  medidas: '',
  atende: '',
  horario: '',
  idiomas: [],
};

const IDIOMAS_OPCOES = [
  'Português',
  'Inglês',
  'Espanhol',
  'Francês',
  'Italiano',
  'Alemão'
];

export default function FemaleRegistration({ onBack }: FemaleRegistrationProps) {
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { setGender } = useStore();
  const { signIn } = useAuthStore();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 6) {
      toast.error('Máximo de 6 fotos permitido');
      return;
    }
    setPhotos(prev => [...prev, ...files]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + videos.length > 3) {
      toast.error('Máximo de 3 vídeos permitido');
      return;
    }
    setVideos(prev => [...prev, ...files]);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setIdDocument(file);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!idDocument) {
        throw new Error('Documento de identificação é obrigatório');
      }

      if (photos.length === 0) {
        throw new Error('Pelo menos uma foto é obrigatória');
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', form.email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Upload photos
      const photoUrls = await Promise.all(
        photos.map(async (photo) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('only-diamonds')
            .upload(filePath, photo, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;
          return filePath;
        })
      );

      // Upload videos
      const videoUrls = await Promise.all(
        videos.map(async (video) => {
          const fileExt = video.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `videos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('only-diamonds')
            .upload(filePath, video, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;
          return filePath;
        })
      );

      // Upload document
      const docExt = idDocument.name.split('.').pop();
      const docName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${docExt}`;
      const documentPath = `documents/${docName}`;

      const { error: documentError } = await supabase.storage
        .from('only-diamonds')
        .upload(documentPath, idDocument, {
          cacheControl: '3600',
          upsert: false
        });

      if (documentError) throw documentError;

      const hashedPassword = hashPassword(form.senha);

      // Create user profile
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            ...form,
            email: form.email.toLowerCase(),
            senha: hashedPassword,
            foto_perfil: photoUrls[0], // First photo as profile picture
            fotos: photoUrls,
            videos: videoUrls,
            documento: documentPath,
            status: 'pending',
            role: 'model',
            genero: 'female'
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Set gender and login
      setGender('female');
      await signIn(form.email, form.senha);

      toast.success('Cadastro realizado com sucesso!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao criar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-950 py-12 px-4">
      <div className="max-w-2xl mx-auto card-luxury p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-luxury-800 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gold-400" />
          </button>
          <h1 className="text-2xl font-bold text-gold-400">
            Cadastro de Modelo
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="input-luxury"
                placeholder="Seu nome artístico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-luxury"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={form.senha}
                onChange={e => setForm({ ...form, senha: e.target.value })}
                className="input-luxury"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Idade
              </label>
              <input
                type="number"
                required
                min="18"
                value={form.idade}
                onChange={e => setForm({ ...form, idade: e.target.value })}
                className="input-luxury"
                placeholder="Idade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Altura
              </label>
              <input
                type="text"
                required
                value={form.altura}
                onChange={e => setForm({ ...form, altura: e.target.value })}
                className="input-luxury"
                placeholder="Ex: 1.70m"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Medidas
              </label>
              <input
                type="text"
                required
                value={form.medidas}
                onChange={e => setForm({ ...form, medidas: e.target.value })}
                className="input-luxury"
                placeholder="Ex: 90-60-90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                required
                value={form.whatsapp}
                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                className="input-luxury"
                placeholder="+XX (XX) XXXXX-XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Local de Atendimento
              </label>
              <input
                type="text"
                required
                value={form.atende}
                onChange={e => setForm({ ...form, atende: e.target.value })}
                className="input-luxury"
                placeholder="Ex: Centro, Zona Sul"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Horário de Atendimento
              </label>
              <input
                type="text"
                required
                value={form.horario}
                onChange={e => setForm({ ...form, horario: e.target.value })}
                className="input-luxury"
                placeholder="Ex: 9h às 22h"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Localização
              </label>
              <input
                type="text"
                required
                value={form.localizacao}
                onChange={e => setForm({ ...form, localizacao: e.target.value })}
                className="input-luxury"
                placeholder="Cidade, Estado"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Idiomas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {IDIOMAS_OPCOES.map((idioma) => (
                <label key={idioma} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.idiomas.includes(idioma)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({
                          ...form,
                          idiomas: [...form.idiomas, idioma]
                        });
                      } else {
                        setForm({
                          ...form,
                          idiomas: form.idiomas.filter(i => i !== idioma)
                        });
                      }
                    }}
                    className="rounded border-luxury-800 text-gold-400 focus:ring-gold-400"
                  />
                  <span className="text-luxury-200">{idioma}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Biografia
            </label>
            <textarea
              required
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="input-luxury"
              placeholder="Fale um pouco sobre você..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-2">
              Fotos do Perfil (máximo 6)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square bg-luxury-900 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square bg-luxury-900 rounded-lg flex items-center justify-center cursor-pointer hover:bg-luxury-800 transition">
                  <Camera className="w-8 h-8 text-gold-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-2">
              Vídeos (máximo 3)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {videos.map((video, index) => (
                <div key={index} className="relative aspect-video bg-luxury-900 rounded-lg overflow-hidden">
                  <video
                    src={URL.createObjectURL(video)}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {videos.length < 3 && (
                <label className="aspect-video bg-luxury-900 rounded-lg flex items-center justify-center cursor-pointer hover:bg-luxury-800 transition">
                  <Camera className="w-8 h-8 text-gold-400" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-2">
              Documento de Identificação
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex-1">
                <div className="border-2 border-dashed border-luxury-800 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-gold-400 transition">
                  <div className="text-center">
                    <Upload className="mx-auto w-8 h-8 text-gold-400" />
                    <span className="mt-2 block text-sm text-luxury-300">
                      {idDocument ? idDocument.name : 'Clique para enviar'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Camera className="w-5 h-5 animate-spin" />
            ) : (
              'Enviar Cadastro para Aprovação'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}