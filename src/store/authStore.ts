import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/hash';
import toast from 'react-hot-toast';

interface User {
  id: string;
  nome: string;
  email: string;
  foto_perfil?: string;
  fotos?: string[];
  role?: string;
  status?: string;
  genero?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const hashedPassword = hashPassword(password);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('senha', hashedPassword)
        .single();

      if (error || !data) {
        throw new Error('Email ou senha incorretos');
      }

      set({ user: data });
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email: string, password: string, nome: string) => {
    set({ loading: true });
    try {
      const hashedPassword = hashPassword(password);

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email: email.toLowerCase(),
            senha: hashedPassword,
            nome,
            role: 'model',
            status: 'pending',
            genero: 'female'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      set({ user: data });
      toast.success('Cadastro realizado com sucesso!');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: () => {
    set({ user: null });
    toast.success('Sessão encerrada');
  },
  updateUser: (user: User) => {
    set({ user });
  },
}));