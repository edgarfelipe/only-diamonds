import React from 'react';
import { Diamond, LogOut } from 'lucide-react';

interface ProfileHeaderProps {
  onLogout: () => void;
}

export default function ProfileHeader({ onLogout }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold text-gold-400 flex items-center gap-2">
        <Diamond className="w-6 h-6" />
        Painel da Modelo
      </h1>
      <button
        onClick={onLogout}
        className="p-2 hover:bg-luxury-800 rounded-lg transition"
      >
        <LogOut className="w-5 h-5 text-gold-400" />
      </button>
    </div>
  );
}