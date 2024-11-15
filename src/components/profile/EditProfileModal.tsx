import React, { useState } from 'react';
import { X, Camera, Loader, Diamond } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase, getPublicUrl } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: user?.nome || '',
    bio: user?.bio || '',
    localizacao: user?.localizacao || '',
    whatsapp: user?.whatsapp || '',
    idade: user?.idade || '',
    altura: user?.altura || '',
    medidas: user?.medidas || '',
    atende: user?.atende || '',
    horario: user?.horario || '',
    idiomas: user?.idiomas || [],
  });

  if (!isOpen) return null;

  const profileImageUrl = getPublicUrl('only-diamonds', user?.foto_perfil);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update(form)
        .eq('id', user.id);

      if (error) throw error;

      updateUser({
        ...user,
        ...form
      });

      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const path = `profile-photos/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('only-diamonds')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('users')
        .update({ foto_perfil: path })
        .eq('id', user.id);

      if (updateError) throw updateError;

      updateUser({
        ...user,
        foto_perfil: path
      });

      toast.success('Foto de perfil atualizada!');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Erro ao atualizar foto de perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="text-xl font-bold text-gold-400">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="p-1 text-luxury-400 hover:text-gold-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Photo */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-luxury-900 border-2 border-gold-400">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={user.nome}
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gold-400" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-gold-400 rounded-full text-luxury-950">
                  <Camera className="w-4 h-4" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="input-luxury"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Biografia
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="input-luxury"
                placeholder="Fale um pouco sobre você..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gold-400 mb-1">
                  Idade
                </label>
                <input
                  type="number"
                  value={form.idade}
                  onChange={(e) => setForm({ ...form, idade: e.target.value })}
                  className="input-luxury"
                  placeholder="Idade"
                  min="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gold-400 mb-1">
                  Altura
                </label>
                <input
                  type="text"
                  value={form.altura}
                  onChange={(e) => setForm({ ...form, altura: e.target.value })}
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
                  value={form.medidas}
                  onChange={(e) => setForm({ ...form, medidas: e.target.value })}
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
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="input-luxury"
                  placeholder="+XX (XX) XXXXX-XXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Local de Atendimento
              </label>
              <input
                type="text"
                value={form.atende}
                onChange={(e) => setForm({ ...form, atende: e.target.value })}
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
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
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
                value={form.localizacao}
                onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                className="input-luxury"
                placeholder="Cidade, Estado"
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-luxury-800 text-gold-400 rounded-lg font-medium hover:bg-luxury-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}