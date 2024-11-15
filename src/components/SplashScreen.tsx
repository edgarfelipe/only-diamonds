import React, { useEffect } from 'react';
import { Diamond } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-luxury-950 via-luxury-900 to-luxury-800 flex items-center justify-center">
      <div className="text-center">
        <Diamond className="w-20 h-20 text-gold-400 animate-pulse" />
        <h1 className="text-4xl font-bold text-gold-400 mt-4 tracking-wider">
          ONLY DIAMONDS
        </h1>
        <p className="text-gold-200/80 mt-2 tracking-wide">
          Luxury Dating Experience
        </p>
      </div>
    </div>
  );
}