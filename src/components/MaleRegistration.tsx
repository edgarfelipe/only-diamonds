import React, { useState } from 'react';
import { Diamond, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/hash';
import { useAuthStore } from '../store/authStore';
import { useStore } from '../store/appStore';
import toast from 'react-hot-toast';

interface RegistrationForm {
  nome: string;
  email: string;
  senha: string;
  idade: string;
  localizacao: string;
}

const initialForm: RegistrationForm = {
  nome: '',
  email: '',
  senha: '',
  idade: '',
  localizacao: '',
};

export default function MaleRegistration() {
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const { setGender } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', form.email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      const hashedPassword = hashPassword(form.senha);

      // Create user profile
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            ...form,
            email: form.email.toLowerCase(),
            senha: hashedPassword,
            status: 'approved', // Male users are auto-approved
            role: 'user',
            genero: 'male'
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Set gender and login
      setGender('male');
      await signIn(form.email, form.senha);

      toast.success('Cadastro realizado com sucesso!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao criar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-950 py-12 px-4">
      <div className="max-w-md mx-auto card-luxury p-6">
        <div className="flex flex-col items-center mb-6">
          <Diamond className="w-12 h-12 text-gold-400 mb-2" />
          <h1 className="text-2xl font-bold text-gold-400">
            Cadastro VIP
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              className="input-luxury"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="input-luxury"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={form.senha}
              onChange={e => setForm({ ...form, senha: e.target.value })}
              className="input-luxury"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Idade
            </label>
            <input
              type="number"
              required
              min="18"
              value={form.idade}
              onChange={e => setForm({ ...form, idade: e.target.value })}
              className="input-luxury"
              placeholder="Idade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-400 mb-1">
              Localização
            </label>
            <input
              type="text"
              required
              value={form.localizacao}
              onChange={e => setForm({ ...form, localizacao: e.target.value })}
              className="input-luxury"
              placeholder="Cidade, Estado"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}