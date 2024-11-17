import React from 'react';
import { Diamond } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 bg-luxury-950/95 backdrop-blur-sm shadow-lg z-40 border-b border-gold-900/20">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gold-400 flex items-center gap-2">
          <Diamond className="w-6 h-6" />
          <span>ONLY DIAMONDS</span>
        </h1>
      </div>
    </header>
  );
}