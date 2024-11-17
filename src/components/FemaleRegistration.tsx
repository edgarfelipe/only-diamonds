import React, { useState } from 'react';
import { Camera, Upload, X, ArrowLeft, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getPublicUrl } from '../lib/supabase';
import { hashPassword } from '../utils/hash';
import { useAuthStore } from '../store/authStore';
import { useStore } from '../store/appStore';
import toast from 'react-hot-toast';

const COUNTRIES = [
  { code: '55', name: 'Brasil 🇧🇷' },
  { code: '351', name: 'Portugal 🇵🇹' },
  { code: '34', name: 'Espanha 🇪🇸' },
  { code: '39', name: 'Itália 🇮🇹' },
  { code: '33', name: 'França 🇫🇷' },
  { code: '44', name: 'Reino Unido 🇬🇧' },
  { code: '49', name: 'Alemanha 🇩🇪' },
  { code: '1', name: 'Estados Unidos 🇺🇸' }
];

interface FemaleRegistrationProps {
  onBack: () => void;
}

interface RegistrationForm {
  nome: string;
  email: string;
  senha: string;
  idade: string;
  countryCode: string;
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
  countryCode: '55',
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

      // Create user first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: form.email.toLowerCase(),
            senha: hashPassword(form.senha),
            nome: form.nome,
            idade: form.idade,
            whatsapp: `${form.countryCode}${form.whatsapp.replace(/\D/g, '')}`,
            localizacao: form.localizacao,
            bio: form.bio,
            altura: form.altura,
            medidas: form.medidas,
            atende: form.atende,
            horario: form.horario,
            idiomas: form.idiomas,
            status: 'pending',
            role: 'model',
            genero: 'female'
          }
        ])
        .select()
        .single();

      if (userError) throw userError;

      // After user is created, upload files
      const userId = userData.id;

      // Upload photos
      const photoUrls = await Promise.all(
        photos.map(async (photo) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `photos/${userId}/${fileName}`;

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
          const filePath = `videos/${userId}/${fileName}`;

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
      const documentPath = `documents/${userId}/${docName}`;

      const { error: documentError } = await supabase.storage
        .from('only-diamonds')
        .upload(documentPath, idDocument, {
          cacheControl: '3600',
          upsert: false
        });

      if (documentError) throw documentError;

      // Update user with file paths
      const { error: updateError } = await supabase
        .from('users')
        .update({
          foto_perfil: photoUrls[0],
          fotos: photoUrls,
          videos: videoUrls,
          documento: documentPath
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Set gender and login
      setGender('female');
      await signIn(form.email, form.senha);

      toast.success('Cadastro realizado com sucesso!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao criar perfil');
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
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  className="input-luxury w-40"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name} (+{country.code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="input-luxury flex-1"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
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
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              'Enviar Cadastro para Aprovação'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}