import React, { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { user, signOut } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmation !== 'DELETAR') {
      toast.error('Digite DELETAR para confirmar');
      return;
    }

    setLoading(true);
    try {
      // Delete user's photos from storage
      if (user?.fotos?.length) {
        for (const photo of user.fotos) {
          await supabase.storage
            .from('only-diamonds')
            .remove([photo]);
        }
      }

      // Delete profile photo
      if (user?.foto_perfil) {
        await supabase.storage
          .from('only-diamonds')
          .remove([user.foto_perfil]);
      }

      // Delete user record
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id);

      if (error) throw error;

      signOut();
      toast.success('Conta excluída com sucesso');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Erro ao excluir conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-md card-luxury">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-luxury-400 hover:text-gold-400 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle className="w-12 h-12" />
          </div>

          <h2 className="text-2xl font-bold text-red-500 text-center mb-4">
            Excluir Conta
          </h2>

          <div className="space-y-4 text-luxury-200">
            <p className="text-center">
              Esta ação é irreversível. Todos os seus dados, fotos e informações serão permanentemente excluídos.
            </p>

            <div className="bg-luxury-900/50 border border-luxury-800 p-4 rounded-lg">
              <p className="font-medium mb-2 text-gold-400">Ao excluir sua conta:</p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>Todas as suas fotos serão removidas</li>
                <li>Seu perfil será excluído permanentemente</li>
                <li>Você perderá acesso a todas as conversas</li>
                <li>Esta ação não pode ser desfeita</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Digite DELETAR para confirmar:
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="input-luxury"
                placeholder="DELETAR"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-luxury-800 text-luxury-200 rounded-lg font-medium hover:bg-luxury-700 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmation !== 'DELETAR'}
              className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Excluir Conta'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}