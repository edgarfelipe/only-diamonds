import React from 'react';
import { Brand } from '../types';

interface BrandsListProps {
  brands: Brand[];
  onBrandClick: (brandId: number) => void;
}

const BrandsList: React.FC<BrandsListProps> = ({ brands, onBrandClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">
      {brands.map((brand) => (
        <button
          key={brand.id}
          onClick={() => onBrandClick(brand.id)}
          className="group p-4 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="mt-3 md:mt-4 text-center text-sm md:text-lg font-medium text-gray-900">
            {brand.name}
          </h3>
        </button>
      ))}
    </div>
  );
};

export default BrandsList;