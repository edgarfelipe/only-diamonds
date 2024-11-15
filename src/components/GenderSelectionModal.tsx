import React, { useState } from 'react';
import { Diamond, Gem } from 'lucide-react';
import { useStore } from '../store/appStore';
import FemaleRegistration from './FemaleRegistration';
import AuthModal from './AuthModal';

export default function GenderSelectionModal() {
  const { setGender } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFemaleRegistration, setShowFemaleRegistration] = useState(false);
  const [showFemaleOptions, setShowFemaleOptions] = useState(false);

  const handleMaleSelect = () => {
    setGender('male');
  };

  const handleFemaleSelect = () => {
    setShowFemaleOptions(true);
  };

  if (showAuthModal) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {
          setShowAuthModal(false);
          setShowFemaleOptions(false);
          setGender(null);
        }}
        initialMode="login"
        isFemaleLogin={true}
      />
    );
  }

  if (showFemaleRegistration) {
    return <FemaleRegistration onBack={() => {
      setShowFemaleRegistration(false);
      setShowFemaleOptions(false);
      setGender(null);
    }} />;
  }

  if (showFemaleOptions) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="card-luxury p-6 w-full max-w-lg">
          <div className="flex items-center justify-center mb-6">
            <Diamond className="w-12 h-12 text-gold-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-gold-400">
            Bem-vinda ao Only Diamonds!
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-gold-500/20 bg-luxury-900/50 hover:bg-luxury-800/50 transition"
            >
              <div className="text-left">
                <span className="block text-lg font-medium text-gold-400">
                  Já tenho uma conta
                </span>
                <span className="text-sm text-luxury-300">
                  Faça login para acessar seu perfil
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setShowFemaleRegistration(true)}
              className="w-full flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-gold-500/20 bg-luxury-900/50 hover:bg-luxury-800/50 transition"
            >
              <div className="text-left">
                <span className="block text-lg font-medium text-gold-400">
                  Criar nova conta
                </span>
                <span className="text-sm text-luxury-300">
                  Cadastre-se para começar a ganhar dinheiro
                </span>
              </div>
            </button>
          </div>
          
          <button
            onClick={() => {
              setShowFemaleOptions(false);
              setGender(null);
            }}
            className="mt-6 w-full py-2 text-luxury-400 hover:text-gold-400 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card-luxury p-6 w-full max-w-lg">
        <div className="flex items-center justify-center mb-6">
          <Diamond className="w-12 h-12 text-gold-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gold-400">
          Selecione seu Perfil
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleMaleSelect}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gold-500/20 bg-luxury-900/50 hover:bg-luxury-800/50 transition group"
          >
            <Diamond className="w-16 h-16 text-gold-400 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-medium text-gold-400">Cliente</span>
          </button>
          
          <button
            onClick={handleFemaleSelect}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gold-500/20 bg-luxury-900/50 hover:bg-luxury-800/50 transition group"
          >
            <Gem className="w-16 h-16 text-gold-400 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-medium text-gold-400">Modelo Diamond</span>
          </button>
        </div>
      </div>
    </div>
  );
}