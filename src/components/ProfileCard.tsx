import React, { useState, useEffect } from 'react';
import { Heart, X, Star, Phone, Diamond, Video, MapPin, Calendar, Info, Clock, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicUrl } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useInteractionStore } from '../store/interactionStore';
import toast from 'react-hot-toast';
import ImageViewer from './ImageViewer';
import VideoPlayer from './VideoPlayer';

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
  distance?: string;
  onLike: () => void;
  onPass: () => void;
  onPrevious: () => void;
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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { likeProfile, unlikeProfile, favoriteProfile, unfavoriteProfile, checkIfLiked, checkIfFavorited } = useInteractionStore();

  const allMedia = [foto_perfil, ...(Array.isArray(fotos) ? fotos : [])].filter(Boolean);

  useEffect(() => {
    if (user) {
      checkIfLiked(id, user.id).then(setIsLiked);
      checkIfFavorited(id, user.id).then(setIsFavorited);
    }
  }, [id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Faça login para curtir perfis');
      return;
    }

    try {
      if (isLiked) {
        await unlikeProfile(id, user.id);
        setIsLiked(false);
      } else {
        await likeProfile(id, user.id, nome, whatsapp);
        setIsLiked(true);
        onLike();
      }
    } catch (error) {
      console.error('Error handling like:', error);
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
        await favoriteProfile(id, user.id, nome, whatsapp);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Faça login para entrar em contato');
      return;
    }
    
    if (whatsapp) {
      const formattedPhone = whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
  };

  const nextMedia = () => {
    if (currentMediaIndex < allMedia.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };

  const previousMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    }
  };

  const currentImage = allMedia[currentMediaIndex];
  const imageUrl = currentImage ? getPublicUrl('only-diamonds', currentImage) : null;

  return (
    <div className="relative w-full max-w-sm mx-auto h-[70vh] rounded-2xl overflow-hidden shadow-2xl perspective">
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative w-full h-full">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={nome}
                className="w-full h-full object-cover"
              />
            )}

            {/* Navigation arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              {currentMediaIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previousMedia();
                  }}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {currentMediaIndex < allMedia.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextMedia();
                  }}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Media indicators */}
            <div className="absolute top-4 inset-x-4">
              <div className="flex gap-1">
                {allMedia.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      index === currentMediaIndex ? 'bg-gold-400' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Info overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {nome} {idade && <span className="text-xl">• {idade}</span>}
              </h3>
              
              {localizacao && (
                <p className="text-white/90 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {localizacao}
                </p>
              )}

              {distance && (
                <p className="text-white/80 text-sm mt-1">
                  {distance}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={handleWhatsAppClick}
                className="p-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition transform hover:scale-105"
              >
                <Phone className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-full transition transform hover:scale-105 ${
                  isFavorited
                    ? 'bg-gold-400 text-luxury-950'
                    : 'bg-white text-luxury-950 hover:bg-gold-400'
                }`}
              >
                <Star className="w-6 h-6" />
              </button>

              <button
                onClick={handleLike}
                className={`p-3 rounded-full transition transform hover:scale-105 ${
                  isLiked
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-luxury-950 hover:bg-pink-500 hover:text-white'
                }`}
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-luxury-900 p-6">
          <div className="h-full overflow-y-auto space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gold-400">{nome}</h3>
              {bio && <p className="text-luxury-200">{bio}</p>}
            </div>

            <div className="space-y-4">
              {altura && (
                <div className="flex items-center gap-2 text-luxury-200">
                  <span className="text-gold-400">Altura:</span>
                  {altura}
                </div>
              )}

              {medidas && (
                <div className="flex items-center gap-2 text-luxury-200">
                  <span className="text-gold-400">Medidas:</span>
                  {medidas}
                </div>
              )}

              {atende && (
                <div className="flex items-center gap-2 text-luxury-200">
                  <span className="text-gold-400">Atende em:</span>
                  {atende}
                </div>
              )}

              {horario && (
                <div className="flex items-center gap-2 text-luxury-200">
                  <span className="text-gold-400">Horário:</span>
                  {horario}
                </div>
              )}

              {idiomas.length > 0 && (
                <div className="flex items-center gap-2 text-luxury-200">
                  <span className="text-gold-400">Idiomas:</span>
                  {idiomas.join(', ')}
                </div>
              )}
            </div>

            {videos.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gold-400 mb-2">
                  Vídeos
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video, index) => {
                    const videoUrl = getPublicUrl('only-diamonds', video);
                    if (!videoUrl) return null;

                    return (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideo(videoUrl);
                        }}
                        className="aspect-video bg-luxury-800 rounded-lg flex items-center justify-center hover:bg-luxury-700 transition"
                      >
                        <Video className="w-8 h-8 text-gold-400" />
                      </button>
                    );
                  })}
                </div>
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
      
      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}