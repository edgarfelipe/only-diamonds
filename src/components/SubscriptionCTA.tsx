import React, { useState, useRef, useEffect } from 'react';
import { Crown, Check, X, Diamond, Gem, Star, Lock, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/hash';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';

const ADMIN_CREDENTIALS = {
  email: 'admin@onlydiamonds.com',
  password: 'admin123',
  role: 'admin'
};

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
  const { user, signIn } = useAuthStore();
  const { createSubscription } = useSubscriptionStore();
  const [isVisible, setIsVisible] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [currentPlan, setCurrentPlan] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (adminEmail === ADMIN_CREDENTIALS.email && adminPassword === ADMIN_CREDENTIALS.password) {
        // Get admin user from database
        const { data: adminUser, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('email', ADMIN_CREDENTIALS.email)
          .eq('senha', hashPassword(ADMIN_CREDENTIALS.password))
          .single();

        if (selectError || !adminUser) {
          // Create admin user if doesn't exist
          const { data: newAdmin, error: insertError } = await supabase
            .from('users')
            .insert([{
              email: ADMIN_CREDENTIALS.email,
              senha: hashPassword(ADMIN_CREDENTIALS.password),
              nome: 'Admin',
              role: ADMIN_CREDENTIALS.role,
              status: 'approved'
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          
          signIn(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
          toast.success('Admin criado e logado com sucesso!');
        } else {
          signIn(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
          toast.success('Login admin realizado com sucesso!');
        }

        setShowAdminModal(false);
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'premium' || !isVisible) return null;

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (!user) {
      setAuthMode('register');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(plan.priceEUR);
      await createSubscription(user.id, amount);
      
      // Redirect to payment page
      window.open('https://buy.stripe.com/7sI17m7D53k7efC8ww', '_blank');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Erro ao criar assinatura');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Admin Login Button */}
        <button
          onClick={() => setShowAdminModal(true)}
          className="fixed top-4 left-4 p-2 rounded-full bg-luxury-900/80 backdrop-blur-sm text-luxury-400 hover:text-gold-400 transition"
        >
          <Lock className="w-5 h-5" />
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
                        onClick={() => handleSubscribe(plan)}
                        disabled={loading}
                        className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition ${
                          plan.featured
                            ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 hover:opacity-90'
                            : 'bg-luxury-800 text-gold-400 hover:bg-luxury-700'
                        } disabled:opacity-50`}
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

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-luxury p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gold-400">Admin Login</h2>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1 text-luxury-400 hover:text-gold-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gold-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="input-luxury"
                  placeholder="admin@onlydiamonds.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gold-400 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input-luxury"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}