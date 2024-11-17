import React, { useState } from 'react';
import { Heart, X, Star, Phone, Diamond, Video, MapPin, Calendar, Info, Clock, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicUrl } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useInteractionStore } from '../store/interactionStore';
import toast from 'react-hot-toast';
import ImageViewer from './ImageViewer';

interface ProfileCardProps {
  id: string;
  nome: string;
  idade?: number;
  localizacao?: string;
  bio?: string;
  foto_perfil?: string;
  fotos?: string[];
  videos?: string[];
  whatsapp?: string;
  altura?: string;
  medidas?: string;
  idiomas?: string[];
  atende?: string;
  horario?: string;
  distance: string;
  onLike: () => void;
  onPass: () => void;
  onPrevious?: () => void;
  hasMore: boolean;
  hasPrevious: boolean;
}

export default function ProfileCard({
  id,
  nome,
  idade,
  localizacao,
  bio,
  foto_perfil,
  fotos = [],
  videos = [],
  whatsapp,
  altura,
  medidas,
  idiomas = [],
  atende,
  horario,
  distance,
  onLike,
  onPass,
  onPrevious,
  hasMore,
  hasPrevious,
}: ProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { likeProfile, unlikeProfile, favoriteProfile, unfavoriteProfile, checkIfLiked, checkIfFavorited } = useInteractionStore();

  const allMedia = [foto_perfil, ...(Array.isArray(fotos) ? fotos : [])].filter(Boolean);

  React.useEffect(() => {
    if (user) {
      checkIfLiked(id, user.id).then(setIsLiked);
      checkIfFavorited(id, user.id).then(setIsFavorited);
    }
  }, [id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) return; // Prevent unliking

    setIsLiked(true);
    onLike();

    // If user is logged in, save the like
    if (user) {
      try {
        await likeProfile(id, user.id);
      } catch (error) {
        console.error('Error handling like:', error);
      }
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Faça login para favoritar perfis');
      return;
    }

    try {
      if (isFavorited) {
        await unfavoriteProfile(id, user.id);
        setIsFavorited(false);
      } else {
        await favoriteProfile(id, user.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
    }
  };

  const currentImageUrl = getPublicUrl('only-diamonds', allMedia[currentMediaIndex]);
  if (!currentImageUrl) return null;

  return (
    <div className="relative w-full max-w-sm mx-auto h-[70vh] rounded-2xl overflow-hidden shadow-2xl perspective">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative w-full h-full">
            <img
              src={currentImageUrl}
              alt={nome}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-luxury-900/50 to-transparent" />
            
            {allMedia.length > 1 && (
              <div className="absolute top-4 left-4 right-4">
                <div className="flex gap-1">
                  {allMedia.map((_, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1 rounded-full ${
                        index === currentMediaIndex
                          ? 'bg-gold-400'
                          : 'bg-gold-400/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Arrows - Only visible when not flipped */}
            {!isFlipped && (
              <>
                {hasPrevious && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrevious?.();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-luxury-900/80 backdrop-blur-sm text-gold-400 hover:bg-luxury-800 transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {hasMore && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPass();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-luxury-900/80 backdrop-blur-sm text-gold-400 hover:bg-luxury-800 transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Diamond className="w-5 h-5 text-gold-400" />
                <h2 className="text-2xl font-bold text-gold-400">
                  {nome}{idade ? `, ${idade}` : ''}
                </h2>
              </div>
              <p className="text-gold-200/80 text-sm">
                {distance}{localizacao ? ` • ${localizacao}` : ''}
              </p>
              {bio && (
                <p className="mt-3 line-clamp-2 text-luxury-100">{bio}</p>
              )}
              
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPass();
                  }}
                  className="w-14 h-14 rounded-full bg-luxury-900/80 backdrop-blur-sm flex items-center justify-center hover:bg-luxury-800 transition border border-luxury-800"
                >
                  <X className="w-6 h-6 text-luxury-300" />
                </button>
                
                <button
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
                    isLiked
                      ? 'bg-gold-600'
                      : 'bg-gradient-to-r from-gold-600 to-gold-400 hover:opacity-90'
                  } shadow-lg`}
                >
                  <Heart className={`w-8 h-8 ${isLiked ? 'fill-white' : ''} text-white`} />
                </button>
                
                <button
                  onClick={handleFavorite}
                  className="w-14 h-14 rounded-full bg-luxury-900/80 backdrop-blur-sm flex items-center justify-center hover:bg-luxury-800 transition border border-luxury-800"
                >
                  <Star className={`w-6 h-6 ${isFavorited ? 'fill-gold-400 text-gold-400' : 'text-luxury-300'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-luxury-950 p-6 overflow-y-auto">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Diamond className="w-6 h-6 text-gold-400" />
              <h3 className="text-xl font-semibold text-gold-400">
                {nome}
              </h3>
            </div>

            {/* Informações da Modelo */}
            <div className="bg-luxury-900/50 rounded-lg p-4 mb-6">
              <h4 className="text-gold-400 font-medium mb-3">Informações</h4>
              <div className="grid grid-cols-2 gap-4">
                {idade && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-luxury-200">{idade} anos</span>
                  </div>
                )}
                {altura && (
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-luxury-200">{altura}</span>
                  </div>
                )}
                {medidas && (
                  <div className="flex items-center gap-2">
                    <Diamond className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-luxury-200">{medidas}</span>
                  </div>
                )}
                {atende && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-luxury-200">{atende}</span>
                  </div>
                )}
                {horario && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-luxury-200">{horario}</span>
                  </div>
                )}
                {idiomas && idiomas.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-luxury-200">{idiomas.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Vídeos */}
            {videos && videos.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gold-400 mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Vídeos
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {videos.map((video, index) => {
                    const videoUrl = getPublicUrl('only-diamonds', video);
                    if (!videoUrl) return null;

                    return (
                      <div key={index} className="aspect-video bg-luxury-900 rounded-lg overflow-hidden">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Galeria de Fotos */}
            {Array.isArray(fotos) && fotos.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gold-400 mb-3">Galeria de Fotos</h4>
                <div className="grid grid-cols-2 gap-3">
                  {fotos.map((photo, index) => {
                    const photoUrl = getPublicUrl('only-diamonds', photo);
                    if (!photoUrl) return null;

                    return (
                      <div 
                        key={index} 
                        className="relative aspect-square bg-luxury-900 rounded-lg overflow-hidden border border-luxury-800 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenImage(photoUrl);
                        }}
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

            {/* Contato */}
            {whatsapp && (
              <div className="mt-auto">
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
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