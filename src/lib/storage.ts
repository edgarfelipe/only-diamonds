import { supabase } from './supabase';
import toast from 'react-hot-toast';

// Maximum dimensions for different image types
const IMAGE_SIZES = {
  product: { width: 800, height: 800 },
  brand: { width: 400, height: 400 },
  category: { width: 1200, height: 800 },
  slide: { width: 1920, height: 1080 }
};

async function optimizeImage(file: File, type: keyof typeof IMAGE_SIZES): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Get target dimensions for this image type
      const maxDimensions = IMAGE_SIZES[type];
      
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      if (width > maxDimensions.width) {
        height = (height * maxDimensions.width) / width;
        width = maxDimensions.width;
      }
      if (height > maxDimensions.height) {
        width = (width * maxDimensions.height) / height;
        height = maxDimensions.height;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and optimize
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP with quality setting
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao otimizar imagem'));
          }
        },
        'image/webp',
        0.85 // quality setting (0-1)
      );
    };
    
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(
  file: File,
  type: 'product' | 'brand' | 'category' | 'slide',
  existingUrl?: string
): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo deve ser uma imagem');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('O tamanho do arquivo deve ser menor que 5MB');
    }

    // Delete existing file if updating
    if (existingUrl) {
      const existingPath = existingUrl.split('/').pop();
      if (existingPath) {
        await deleteImage(`${type}s/${existingPath}`);
      }
    }

    // Optimize image
    const optimizedBlob = await optimizeImage(file, type);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${type}_${timestamp}_${randomString}.webp`;
    const filePath = `${type}s/${filename}`;

    // Upload new file
    const { error: uploadError, data } = await supabase.storage
      .from('fotos_valeria')
      .upload(filePath, optimizedBlob, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    if (!data) {
      throw new Error('Falha ao fazer upload da imagem');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('fotos_valeria')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    toast.error(error.message || 'Erro ao fazer upload da imagem');
    throw error;
  }
}

export async function deleteImage(path: string): Promise<void> {
  if (!path) return;
  
  try {
    const { error } = await supabase.storage
      .from('fotos_valeria')
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in delete operation:', error);
    throw error;
  }
}