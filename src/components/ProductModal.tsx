import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, MessageCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const ProductModal: React.FC<ProductModalProps> = ({ products, isOpen, onClose, title }) => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isVerticalScroll, setIsVerticalScroll] = useState(false);

  const currentProduct = products[currentProductIndex];

  // Reset touch and indexes on modal open/close or product change
  useEffect(() => {
    setTouchStart(null);
    setTouchEnd(null);
    setCurrentImageIndex(0);
  }, [currentProductIndex, isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setIsVerticalScroll(false);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const xDistance = touchStart.x - touchEnd.x;
    const yDistance = Math.abs(touchStart.y - touchEnd.y);
    
    // If vertical scroll is detected, don't process swipe
    if (yDistance > 50) {
      setIsVerticalScroll(true);
      return;
    }

    const minSwipeDistance = 50;
    
    if (Math.abs(xDistance) < minSwipeDistance) return;

    if (xDistance > 0) {
      // Left swipe
      if (currentProductIndex < products.length - 1) {
        setCurrentProductIndex(prev => prev + 1);
      }
    } else {
      // Right swipe
      if (currentProductIndex > 0) {
        setCurrentProductIndex(prev => prev - 1);
      }
    }
  }, [touchStart, touchEnd, currentProductIndex, products.length]);

  const nextProduct = () => {
    if (currentProductIndex < products.length - 1) {
      setCurrentProductIndex(prev => prev + 1);
    }
  };

  const prevProduct = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(prev => prev - 1);
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Olá! Gostaria de saber mais sobre o produto: ${currentProduct.name}`;
    const whatsappNumber = "351961217829";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black md:bg-black/75 overscroll-none">
      <div className="h-full w-full md:p-4 flex items-center justify-center">
        <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-xl overflow-hidden relative flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl md:text-2xl font-light">
                {title} <span className="font-medium">({products.length})</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentProductIndex + 1} de {products.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative">
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={currentProduct.images[currentImageIndex]}
                  alt={currentProduct.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                
                {/* Image Navigation */}
                {currentProduct.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {currentProduct.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-medium mb-2">{currentProduct.name}</h3>
                <p className="text-gray-600 mb-4 text-sm md:text-base">{currentProduct.description}</p>
                
                <div className="space-y-2 mb-6">
                  {currentProduct.brand && (
                    <p className="text-sm text-gray-500">
                      Marca: <span className="text-gray-900">{currentProduct.brand.name}</span>
                    </p>
                  )}
                  {currentProduct.category && (
                    <p className="text-sm text-gray-500">
                      Categoria: <span className="text-gray-900">{currentProduct.category.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with WhatsApp Button - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white border-t p-4">
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Consultar via WhatsApp</span>
            </button>
          </div>

          {/* Desktop Navigation Arrows */}
          {products.length > 1 && (
            <>
              <button
                onClick={prevProduct}
                disabled={currentProductIndex === 0}
                className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextProduct}
                disabled={currentProductIndex === products.length - 1}
                className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;