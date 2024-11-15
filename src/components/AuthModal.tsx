import React, { useState } from 'react';
import { X, Loader, Diamond } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useStore } from '../store/appStore';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  isFemaleLogin?: boolean;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  isFemaleLogin = false
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signIn, signUp, loading } = useAuthStore();
  const { setGender } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        await signIn(email, password);
        if (isFemaleLogin) {
          setGender('female');
        }
      } else {
        await signUp(email, password, name);
      }
      onClose();
    } catch (error) {
      // Error already handled in authStore
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <div className="modal-header">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-luxury-400 hover:text-gold-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="flex flex-col items-center mb-6">
            <Diamond className="w-12 h-12 text-gold-400 mb-2" />
            <h2 className="text-2xl font-bold text-gold-400">
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && !isFemaleLogin && (
              <div>
                <label className="block text-sm font-medium text-gold-400 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-luxury"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxury"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-400 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-luxury"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                'Entrar'
              ) : (
                'Criar Conta'
              )}
            </button>

            {!isFemaleLogin && (
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="w-full text-sm text-luxury-400 hover:text-gold-400 transition"
              >
                {mode === 'login'
                  ? 'Não tem uma conta? Cadastre-se'
                  : 'Já tem uma conta? Entre'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}