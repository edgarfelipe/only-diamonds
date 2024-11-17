import React, { useState, useEffect } from 'react';
import { Diamond, Lock, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/hash';
import toast from 'react-hot-toast';

const ADMIN_CREDENTIALS = {
  email: 'admin@onlydiamonds.com',
  password: '88449596'
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.user?.role === 'admin') {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
        throw new Error('Credenciais inválidas');
      }

      const hashedPassword = hashPassword(password);

      // Try to get existing admin
      const { data: admin, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      let adminUser = admin;

      // Create admin if doesn't exist
      if (!admin) {
        const { data: newAdmin, error: createError } = await supabase
          .from('users')
          .insert([{
            email: ADMIN_CREDENTIALS.email,
            senha: hashedPassword,
            nome: 'Admin',
            role: 'admin',
            status: 'approved',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;
        adminUser = newAdmin;
      } else {
        // Verify password for existing admin
        if (admin.senha !== hashedPassword) {
          throw new Error('Senha incorreta');
        }
      }

      // Store admin session
      localStorage.setItem('auth-storage', JSON.stringify({ 
        state: { user: adminUser },
        version: 0
      }));

      toast.success('Login realizado com sucesso!');
      
      // Use navigate instead of window.location for smoother transition
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-950 flex items-center justify-center p-4">
      <div className="card-luxury p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Diamond className="w-12 h-12 text-gold-400 mb-2" />
          <h1 className="text-2xl font-bold text-gold-400">
            Admin Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}