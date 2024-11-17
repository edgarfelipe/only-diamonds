import React, { useState } from 'react';
import { Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicUrl } from '../lib/supabase';
import ImageViewer from './ImageViewer';
import VideoPlayer from './VideoPlayer';
import ImageProtection from './ImageProtection';

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
  onLike,
  onPass,
  onPrevious,
  hasMore,
  hasPrevious,
}: ProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const imageUrl = foto_perfil ? getPublicUrl('only-diamonds', foto_perfil) : null;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (whatsapp) {
      window.open(`https://wa.me/${whatsapp}`, '_blank');
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div className="relative w-full h-full">
            {imageUrl && (
              <ImageProtection
                imageUrl={imageUrl}
                alt={nome}
                className="w-full h-full object-cover"
              />
            )}

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {nome} {idade && <span className="text-xl">• {idade}</span>}
              </h2>
              
              {localizacao && (
                <p className="text-white/80 mt-1">
                  {localizacao}
                </p>
              )}

              {/* Navigation and WhatsApp buttons */}
              <div className="flex justify-between items-center mt-4">
                {hasPrevious ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrevious();
                    }}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-gold-400 hover:text-luxury-950 transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                ) : (
                  <div className="w-12" />
                )}

                <button
                  onClick={handleWhatsAppClick}
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-gold-400 hover:text-luxury-950 transition"
                >
                  <Phone className="w-6 h-6" />
                </button>

                {hasMore ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike();
                    }}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-gold-400 hover:text-luxury-950 transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                ) : (
                  <div className="w-12" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="h-full bg-luxury-900 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-gold-400 mb-4">Informações</h3>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                {altura && (
                  <div className="text-luxury-200">
                    <span>Altura: {altura}</span>
                  </div>
                )}

                {medidas && (
                  <div className="text-luxury-200">
                    <span>Medidas: {medidas}</span>
                  </div>
                )}

                {atende && (
                  <div className="text-luxury-200">
                    <span>Atende em: {atende}</span>
                  </div>
                )}

                {horario && (
                  <div className="text-luxury-200">
                    <span>Horário: {horario}</span>
                  </div>
                )}

                {idiomas.length > 0 && (
                  <div className="text-luxury-200">
                    <span>Idiomas: {idiomas.join(', ')}</span>
                  </div>
                )}

                {bio && (
                  <div className="mt-2">
                    <h4 className="text-gold-400 font-medium mb-2">Sobre</h4>
                    <p className="text-luxury-200">{bio}</p>
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              {fotos && fotos.length > 0 && (
                <div>
                  <h4 className="text-gold-400 font-medium mb-2">Fotos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {fotos.map((photo, index) => {
                      const photoUrl = getPublicUrl('only-diamonds', photo);
                      if (!photoUrl) return null;

                      return (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImage(photoUrl);
                          }}
                        >
                          <ImageProtection
                            imageUrl={photoUrl}
                            className="w-full h-full object-cover hover:scale-110 transition duration-300"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Video Gallery */}
              {videos && videos.length > 0 && (
                <div>
                  <h4 className="text-gold-400 font-medium mb-2">Vídeos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {videos.map((video, index) => {
                      const videoUrl = getPublicUrl('only-diamonds', video);
                      if (!videoUrl) return null;

                      return (
                        <div
                          key={index}
                          className="aspect-video rounded-lg overflow-hidden bg-luxury-800 relative group cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideo(videoUrl);
                          }}
                        >
                          <video
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition">
                            <Phone className="w-12 h-12 text-white group-hover:scale-110 transition" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          protected
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