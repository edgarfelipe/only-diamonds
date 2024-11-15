import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Diamond, Settings, LogOut, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MaleProfile() {
  const { user, signOut } = useAuthStore();

  const handleLogout = () => {
    signOut();
    toast.success('Sessão encerrada com sucesso');
  };

  return (
    <div className="min-h-screen bg-luxury-950">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="card-luxury p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Diamond className="w-6 h-6 text-gold-400" />
              <h1 className="text-xl font-bold text-gold-400">
                {user?.nome}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-luxury-800 rounded-lg transition"
            >
              <LogOut className="w-5 h-5 text-gold-400" />
            </button>
          </div>

          <div className="text-sm text-luxury-300">
            <p>Idade: {user?.idade} anos</p>
            <p>Localização: {user?.localizacao}</p>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card-luxury p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-gold-400" />
              <h2 className="font-semibold text-gold-400">Curtidas</h2>
            </div>
            <p className="text-2xl font-bold text-gold-300">0</p>
          </div>

          <div className="card-luxury p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-gold-400" />
              <h2 className="font-semibold text-gold-400">Favoritos</h2>
            </div>
            <p className="text-2xl font-bold text-gold-300">0</p>
          </div>
        </div>

        {/* Settings */}
        <div className="card-luxury">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-luxury-800/50 transition"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gold-400" />
              <span className="text-luxury-200">Configurações</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}