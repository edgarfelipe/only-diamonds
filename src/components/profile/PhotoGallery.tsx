import React, { useState } from 'react';
import { Trash2, Loader, Camera, Video } from 'lucide-react';
import { getPublicUrl } from '../../lib/supabase';

interface PhotoGalleryProps {
  photos: string[];
  videos?: string[];
  onDelete: (url: string, type: 'photo' | 'video') => void;
  onUpload?: (files: FileList, type: 'photo' | 'video') => void;
  isLoading?: boolean;
}

export default function PhotoGallery({ photos, videos = [], onDelete, onUpload, isLoading }: PhotoGalleryProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    if (e.target.files && onUpload) {
      onUpload(e.target.files, type);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-luxury-800">
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-2 px-1 text-sm font-medium transition ${
            activeTab === 'photos'
              ? 'text-gold-400 border-b-2 border-gold-400'
              : 'text-luxury-400 hover:text-gold-200'
          }`}
        >
          Fotos
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-2 px-1 text-sm font-medium transition ${
            activeTab === 'videos'
              ? 'text-gold-400 border-b-2 border-gold-400'
              : 'text-luxury-400 hover:text-gold-200'
          }`}
        >
          Vídeos
        </button>
      </div>

      {activeTab === 'photos' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo, index) => {
            const imageUrl = getPublicUrl('only-diamonds', photo);
            if (!imageUrl) return null;

            return (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <img
                  src={imageUrl}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDelete(photo, 'photo')}
                    className="absolute bottom-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform translate-y-full group-hover:translate-y-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {onUpload && photos.length < 20 && (
            <label className="aspect-square rounded-lg bg-luxury-900/50 flex items-center justify-center cursor-pointer hover:bg-luxury-800/50 transition border-2 border-dashed border-luxury-800 group">
              <div className="text-center">
                <Camera className="w-8 h-8 text-gold-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-sm text-luxury-400 block">Adicionar Foto</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {videos.map((video, index) => {
            const videoUrl = getPublicUrl('only-diamonds', video);
            if (!videoUrl) return null;

            return (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  controls
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDelete(video, 'video')}
                    className="absolute bottom-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform translate-y-full group-hover:translate-y-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {onUpload && videos.length < 3 && (
            <label className="aspect-video rounded-lg bg-luxury-900/50 flex items-center justify-center cursor-pointer hover:bg-luxury-800/50 transition border-2 border-dashed border-luxury-800 group">
              <div className="text-center">
                <Video className="w-8 h-8 text-gold-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-sm text-luxury-400 block">Adicionar Vídeo</span>
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="hidden"
                multiple={videos.length === 0}
              />
            </label>
          )}
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-luxury-950/80 flex items-center justify-center z-50">
          <Loader className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      )}
    </div>
  );
}