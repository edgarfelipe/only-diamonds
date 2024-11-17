import React, { useState, useEffect } from 'react';
import { Heart, X, Star, Phone, Diamond, Video, MapPin, Calendar, Info, Clock, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicUrl } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useInteractionStore } from '../store/interactionStore';
import { useNotificationStore } from '../store/notificationStore';
import toast from 'react-hot-toast';
import ImageViewer from './ImageViewer';
import VideoPlayer from './VideoPlayer';

// ... rest of the imports ...

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
  const { likeProfile, unlikeProfile, favoriteProfile, unfavoriteProfile, checkIfLiked, checkIfFavorited, addProfileView } = useInteractionStore();

  const allMedia = [foto_perfil, ...(Array.isArray(fotos) ? fotos : [])].filter(Boolean);

  useEffect(() => {
    if (user) {
      checkIfLiked(id, user.id).then(setIsLiked);
      checkIfFavorited(id, user.id).then(setIsFavorited);
    }
    // Add profile view
    addProfileView(id, user?.id, nome, whatsapp);
  }, [id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) return;

    setIsLiked(true);
    onLike();

    if (user) {
      try {
        await likeProfile(id, user.id, nome, whatsapp);
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
        await favoriteProfile(id, user.id, nome, whatsapp);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
    }
  };

  const handleWhatsAppClick = async () => {
    if (whatsapp) {
      // Send WhatsApp notification
      await useNotificationStore.getState().sendNotification({
        type: 'whatsapp',
        modelName: nome,
        modelPhone: whatsapp,
        userName: user?.nome
      });
      window.open(`https://wa.me/${whatsapp}`, '_blank');
    }
  };

  // ... rest of the component code ...

  return (
    <div className="relative w-full max-w-sm mx-auto h-[70vh] rounded-2xl overflow-hidden shadow-2xl perspective">
      {/* ... rest of the JSX ... */}
      
      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
      
      {/* ... rest of the JSX ... */}
    </div>
  );
}