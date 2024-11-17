import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  created_at?: string;
  subscription_end?: string;
  videos?: string[];
  bio?: string;
  whatsapp?: string;
  idade?: number;
  altura?: string;
  medidas?: string;
  atende?: string;
  horario?: string;
  idiomas?: string[];
  localizacao?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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

          // Create a session in Supabase auth
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password: hashedPassword,
          });

          if (authError) throw authError;

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

          // Create auth user first
          const { error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: hashedPassword,
          });

          if (authError) throw authError;

          const { data, error } = await supabase
            .from('users')
            .insert([
              {
                email: email.toLowerCase(),
                senha: hashedPassword,
                nome,
                role: 'model',
                status: 'pending',
                genero: 'female',
                created_at: new Date().toISOString()
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
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null });
          toast.success('Sessão encerrada');
        } catch (error) {
          console.error('Error signing out:', error);
          toast.error('Erro ao encerrar sessão');
        }
      },
      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user
      })
    }
  )
);