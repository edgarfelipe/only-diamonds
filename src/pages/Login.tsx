import React, { useState, useEffect } from 'react';
import { Diamond, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/hash';
import toast from 'react-hot-toast';
import FemaleRegistration from '../components/FemaleRegistration';

export default function Login() {
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const { state } = JSON.parse(authData);
          if (state?.user?.role === 'model') {
            navigate('/profile', { replace: true });
          }
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hashedPassword = hashPassword(form.password);

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', form.email.toLowerCase())
        .eq('senha', hashedPassword)
        .eq('role', 'model')
        .single();

      if (error || !user) {
        throw new Error('Email ou senha incorretos');
      }

      // Store model session
      localStorage.setItem('auth-storage', JSON.stringify({ 
        state: { user },
        version: 0
      }));

      toast.success('Login realizado com sucesso!');
      
      // Use replace: true to prevent going back to login page
      navigate('/profile', { replace: true });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (showRegistration) {
    return <FemaleRegistration onBack={() => setShowRegistration(false)} />;
  }

  return (
    <div className="min-h-screen bg-luxury-950 flex items-center justify-center p-4">
      <div className="card-luxury p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Diamond className="w-12 h-12 text-gold-400 mb-2" />
          <h1 className="text-2xl font-bold text-gold-400">
            Área da Modelo
          </h1>
          <p className="text-luxury-300 mt-2 text-center">
            Faça login ou cadastre-se para começar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-luxury"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-luxury-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-luxury-900 text-luxury-400">ou</span>
            </div>
          </div>

          <button
            onClick={() => setShowRegistration(true)}
            className="mt-6 w-full py-3 px-4 bg-luxury-800 text-gold-400 rounded-lg font-semibold hover:bg-luxury-700 transition"
          >
            Criar Nova Conta
          </button>
        </div>
      </div>
    </div>
  );
}