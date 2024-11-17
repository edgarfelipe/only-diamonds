import React from 'react';
import { Heart, Star, Eye, Check, AlertTriangle } from 'lucide-react';
import { getPublicUrl } from '../../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ModelCardProps {
  model: {
    id: string;
    nome: string;
    foto_perfil?: string;
    subscription_end?: string;
    likes: number;
    views: number;
    favorites: number;
    created_at: string;
    status: string;
  };
  onSelect: () => void;
  isSelected: boolean;
}

export default function ModelCard({ model, onSelect, isSelected }: ModelCardProps) {
  const profileUrl = model.foto_perfil ? getPublicUrl('only-diamonds', model.foto_perfil) : null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-400';
      case 'pending':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-luxury-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`card-luxury p-4 cursor-pointer transition ${
        isSelected ? 'border-gold-400' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        {profileUrl && (
          <img
            src={profileUrl}
            alt={model.nome}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gold-400">{model.nome}</h3>
            <span className={`flex items-center gap-1 text-sm ${getStatusColor(model.status)}`}>
              {getStatusIcon(model.status)}
              {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-luxury-300">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-gold-400" />
              {model.likes}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-gold-400" />
              {model.favorites}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-gold-400" />
              {model.views}
            </span>
          </div>
          
          <p className="text-xs text-luxury-400 mt-1">
            Cadastro: {format(new Date(model.created_at), "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>
    </div>
  );
}