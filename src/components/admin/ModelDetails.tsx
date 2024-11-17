import React from 'react';
import { getPublicUrl } from '../../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Heart, Star, Eye, Calendar, MapPin, Phone } from 'lucide-react';
import ImageViewer from '../ImageViewer';

interface ModelDetailsProps {
  model: any;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

export default function ModelDetails({ model, onApprove, onReject }: ModelDetailsProps) {
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-luxury p-6">
      <h3 className="text-xl font-semibold text-gold-400 mb-4">
        Detalhes do Perfil
      </h3>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <p><span className="text-gold-400">Nome:</span> {model.nome}</p>
          <p><span className="text-gold-400">Email:</span> {model.email}</p>
          <p><span className="text-gold-400">Idade:</span> {model.idade} anos</p>
          <p><span className="text-gold-400">Localização:</span> {model.localizacao}</p>
          <p><span className="text-gold-400">WhatsApp:</span> {model.whatsapp}</p>
          {model.bio && (
            <div>
              <span className="text-gold-400">Bio:</span>
              <p className="text-sm text-luxury-200 mt-1">{model.bio}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-gold-400" />
            </div>
            <p className="text-xl font-bold text-gold-400">{model.likes || 0}</p>
            <p className="text-sm text-luxury-400">Curtidas</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-gold-400" />
            </div>
            <p className="text-xl font-bold text-gold-400">{model.favorites || 0}</p>
            <p className="text-sm text-luxury-400">Favoritos</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center mb-2">
              <Eye className="w-6 h-6 text-gold-400" />
            </div>
            <p className="text-xl font-bold text-gold-400">{model.views || 0}</p>
            <p className="text-sm text-luxury-400">Visualizações</p>
          </div>
        </div>

        {/* Photos */}
        {model.fotos && model.fotos.length > 0 && (
          <div>
            <h4 className="text-gold-400 font-medium mb-2">Fotos</h4>
            <div className="grid grid-cols-3 gap-3">
              {model.fotos.map((photo: string, index: number) => {
                const photoUrl = getPublicUrl('only-diamonds', photo);
                if (!photoUrl) return null;

                return (
                  <div
                    key={index}
                    className="relative aspect-square bg-luxury-900 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setFullscreenImage(photoUrl)}
                  >
                    <img
                      src={photoUrl}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Document */}
        {model.documento && (
          <div>
            <h4 className="text-gold-400 font-medium mb-2">Documento</h4>
            <div
              className="relative aspect-[3/2] bg-luxury-900 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setFullscreenImage(getPublicUrl('only-diamonds', model.documento)!)}
            >
              <img
                src={getPublicUrl('only-diamonds', model.documento)}
                alt="Documento"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Approval Buttons */}
        {model.status === 'pending' && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              Aprovar
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              Rejeitar
            </button>
          </div>
        )}
      </div>

      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </div>
  );
}