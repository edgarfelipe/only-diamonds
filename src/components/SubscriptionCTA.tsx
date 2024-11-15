import React, { useState, useRef, useEffect } from 'react';
import { Crown, Check, X, Diamond, Gem, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AuthModal from './AuthModal';

const FEATURES = [
  'Acesso ilimitado a todas as fotos',
  'Chat direto com as modelos',
  'Visualização de vídeos exclusivos',
  'Prioridade nas mensagens',
  'Sem anúncios',
  'Suporte VIP 24/7'
];

const PLANS = [
  {
    name: 'Diamond',
    priceEUR: '49.90',
    period: 'mês',
    featured: false,
    icon: Diamond
  },
  {
    name: 'Premium Diamond',
    priceEUR: '119.90',
    period: '3 meses',
    featured: true,
    savings: 'Economize 20%',
    icon: Gem
  },
  {
    name: 'Elite Diamond',
    priceEUR: '399.90',
    period: 'ano',
    featured: false,
    savings: 'Economize 35%',
    icon: Star
  }
];

export default function SubscriptionCTA() {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [currentPlan, setCurrentPlan] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (user?.role === 'premium' || !isVisible) return null;

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0 && currentPlan < PLANS.length - 1) {
      // Swiped left
      setCurrentPlan(prev => prev + 1);
    }

    if (distance < 0 && currentPlan > 0) {
      // Swiped right
      setCurrentPlan(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <>
      <div className="subscription-modal">
        <button
          onClick={() => setIsVisible(false)}
          className="subscription-close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="h-full flex flex-col">
          <div className="text-center p-4 sm:p-6">
            <h2 className="text-3xl font-bold text-gold-400">
              Experiência VIP Diamond
            </h2>
            <p className="text-luxury-300 mt-2">
              Escolha o plano perfeito para você
            </p>
          </div>

          <div 
            className="relative flex-1 overflow-hidden touch-pan-x"
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div 
              className="subscription-content"
              style={{
                transform: `translateX(-${currentPlan * 100}%)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {PLANS.map((plan, index) => (
                <div
                  key={plan.name}
                  className="subscription-slide"
                >
                  <div
                    className={`relative h-full p-6 transition-transform ${
                      plan.featured
                        ? 'bg-gradient-to-br from-gold-900/50 to-luxury-900/50 border border-gold-500/20'
                        : 'bg-luxury-900/50 border border-luxury-800/50'
                    } rounded-xl`}
                  >
                    {plan.featured && (
                      <div className="absolute -top-2 -right-2">
                        <Crown className="w-6 h-6 text-gold-400" />
                      </div>
                    )}
                    <div className="text-center">
                      <plan.icon className="w-12 h-12 mx-auto mb-4 text-gold-400" />
                      <h3 className="text-xl font-semibold text-gold-400">
                        {plan.name}
                      </h3>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-gold-300">€{plan.priceEUR}</span>
                        <span className="text-luxury-400">/{plan.period}</span>
                      </div>
                      {plan.savings && (
                        <span className="mt-2 inline-block text-sm bg-gold-400/10 text-gold-400 rounded-full px-3 py-1">
                          {plan.savings}
                        </span>
                      )}
                      <button
                        onClick={() => handleAuthClick('register')}
                        className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition ${
                          plan.featured
                            ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 hover:opacity-90'
                            : 'bg-luxury-800 text-gold-400 hover:bg-luxury-700'
                        }`}
                      >
                        Assinar Agora
                      </button>

                      <div className="mt-6 space-y-3 text-sm text-left">
                        {FEATURES.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-gold-400" />
                            <span className="text-luxury-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Navigation Dots */}
            <div className="sm:hidden flex justify-center gap-2 mt-4 pb-4">
              {PLANS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPlan(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentPlan === index ? 'bg-gold-400' : 'bg-luxury-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleAuthClick('register')}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Começar Agora
            </button>
            <button
              onClick={() => handleAuthClick('register')}
              className="w-full sm:w-auto px-8 py-3 bg-luxury-800 text-gold-400 rounded-lg font-semibold hover:bg-luxury-700 transition"
            >
              Cadastro Gratuito
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}