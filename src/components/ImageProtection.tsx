import React, { useEffect, useRef } from 'react';
import { Diamond } from 'lucide-react';

interface ImageProtectionProps {
  imageUrl: string;
  alt?: string;
  className?: string;
}

export default function ImageProtection({ imageUrl, alt = '', className = '' }: ImageProtectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      ctx.save();
      
      // Semi-transparent background for watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Repeating watermark pattern
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.rotate(-45 * Math.PI / 180);

      const text = 'ONLY DIAMONDS';
      const pattern = `${text} • `;
      const patternWidth = ctx.measureText(pattern).width;

      for (let y = -canvas.height; y < canvas.height * 2; y += 40) {
        for (let x = -canvas.width; x < canvas.width * 2; x += patternWidth + 20) {
          ctx.fillText(pattern, x, y);
        }
      }

      // Center watermark
      ctx.restore();
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Diamond icon as watermark
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(20, 0);
      ctx.lineTo(0, 20);
      ctx.lineTo(-20, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      ctx.restore();

      ctx.fillText('ONLY DIAMONDS', centerX, centerY + 40);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div className={`relative select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          userSelect: 'none'
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}