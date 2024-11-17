import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onWhatsAppClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onWhatsAppClick }) => {
  return (
    <div 
      className="group cursor-pointer touch-manipulation"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full aspect-square object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onWhatsAppClick(product);
          }}
          className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-2 md:px-6 md:py-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex items-center space-x-2 hover:bg-orange-500 hover:text-white text-sm md:text-base shadow-lg"
        >
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
          <span>Consultar</span>
        </button>
      </div>
      <div className="mt-3 md:mt-4 text-center px-2">
        <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-xs md:text-sm text-gray-500 line-clamp-2">{product.description}</p>
        {product.brand && (
          <p className="mt-1 text-xs md:text-sm font-medium text-orange-500">{product.brand.name}</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;