import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImage } from '../lib/storage';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  type: 'product' | 'brand' | 'category' | 'slide';
  onUpload: (url: string) => void;
  onUploadStart?: () => void;
  existingUrl?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  type,
  onUpload,
  onUploadStart,
  existingUrl,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(existingUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      onUploadStart?.();
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload file
      const publicUrl = await uploadImage(file, type);
      onUpload(publicUrl);
      
      // Cleanup preview
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem');
      setPreview('');
      onUpload('');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    setPreview('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-orange-500 transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-2"></div>
              <span className="text-sm text-gray-500">Fazendo upload...</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Clique para fazer upload da imagem</span>
              <span className="text-xs text-gray-400 mt-1">Tamanho máximo: 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;