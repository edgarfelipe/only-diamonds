import React from 'react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onClick(category)}
    >
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden rounded-xl">
        <img
          src={category.image_url}
          alt={category.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center transform group-hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-xl sm:text-2xl font-light text-white px-4">
              {category.name}
            </h3>
            <div className="h-0.5 w-12 bg-orange-500 mx-auto mt-3 md:mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryCard;