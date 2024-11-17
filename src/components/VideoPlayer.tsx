import React from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoUrl, onClose }: VideoPlayerProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-luxury-900/80 rounded-full text-luxury-200 hover:text-gold-400 transition"
      >
        <X className="w-6 h-6" />
      </button>
      
      <video
        src={videoUrl}
        className="max-w-full max-h-full"
        controls
        autoPlay
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}