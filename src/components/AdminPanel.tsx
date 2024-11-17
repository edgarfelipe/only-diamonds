import React, { useEffect, useState } from 'react';
import { supabase, getPublicUrl } from '../lib/supabase';
import { 
  Diamond, Heart, Star, Users, Eye, Check, X, ChevronRight, 
  ChevronLeft, DollarSign, Clock, AlertTriangle, LogOut,
  Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import { useInteractionStore } from '../store/interactionStore';
import ImageViewer from './ImageViewer';
import ModelCard from './admin/ModelCard';
import ModelDetails from './admin/ModelDetails';

interface ModelProfile {
  id: string;
  nome: string;
  email: string;
  foto_perfil?: string;
  fotos?: string[];
  videos?: string[];
  documento?: string;
  created_at: string;
  idade?: number;
  localizacao?: string;
  whatsapp?: string;
  bio?: string;
  status: string;
  subscription_end?: string;
  likes: number;
  views: number;
  favorites: number;
}

export default function AdminPanel() {
  const { signOut } = useAuthStore();
  const { getLikes, getFavorites, getViews } = useInteractionStore();
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    expired: 0
  });

  useEffect(() => {
    loadModels();
  }, [statusFilter]);

  const loadModels = async () => {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'model');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Load interaction stats for each model
      const modelsWithStats = await Promise.all(
        (data || []).map(async (model) => {
          const [likes, favorites, views] = await Promise.all([
            getLikes(model.id),
            getFavorites(model.id),
            getViews(model.id)
          ]);

          return {
            ...model,
            likes,
            favorites,
            views
          };
        })
      );

      setModels(modelsWithStats);

      // Update stats
      setStats({
        total: modelsWithStats.length,
        pending: modelsWithStats.filter(m => m.status === 'pending').length,
        active: modelsWithStats.filter(m => m.subscription_end && isAfter(new Date(m.subscription_end), new Date())).length,
        expired: modelsWithStats.filter(m => m.subscription_end && !isAfter(new Date(m.subscription_end), new Date())).length
      });
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Erro ao carregar modelos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    toast.success('Sessão encerrada com sucesso');
  };

  const handleApprove = async () => {
    if (!selectedModel) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', selectedModel.id);

      if (error) throw error;

      toast.success('Perfil aprovado com sucesso!');
      await loadModels();
      setSelectedModel(null);
    } catch (error) {
      console.error('Error approving model:', error);
      toast.error('Erro ao aprovar perfil');
    }
  };

  const handleReject = async () => {
    if (!selectedModel) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'rejected' })
        .eq('id', selectedModel.id);

      if (error) throw error;

      toast.success('Perfil rejeitado');
      await loadModels();
      setSelectedModel(null);
    } catch (error) {
      console.error('Error rejecting model:', error);
      toast.error('Erro ao rejeitar perfil');
    }
  };

  const filteredModels = models.filter(model => 
    model.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-950 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Diamond className="w-8 h-8 text-gold-400" />
            <h1 className="text-2xl font-bold text-gold-400">Painel Administrativo</h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-luxury-800 rounded-lg transition flex items-center gap-2 text-gold-400"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card-luxury p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-gold-400" />
              <h3 className="font-semibold text-gold-400">Total de Modelos</h3>
            </div>
            <p className="text-2xl font-bold text-gold-300">{stats.total}</p>
          </div>

          <div className="card-luxury p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gold-400" />
              <h3 className="font-semibold text-gold-400">Pendentes</h3>
            </div>
            <p className="text-2xl font-bold text-gold-300">{stats.pending}</p>
          </div>

          <div className="card-luxury p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-400">Assinaturas Ativas</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-300">{stats.active}</p>
          </div>

          <div className="card-luxury p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-red-400">Assinaturas Vencidas</h3>
            </div>
            <p className="text-2xl font-bold text-red-300">{stats.expired}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full input-luxury pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-400" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-luxury"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Models List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gold-400 mb-4">
              Lista de Modelos
            </h2>
            
            {filteredModels.length === 0 ? (
              <div className="text-center py-12 text-luxury-400">
                Nenhum modelo encontrado
              </div>
            ) : (
              filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onSelect={() => setSelectedModel(model)}
                  isSelected={selectedModel?.id === model.id}
                />
              ))
            )}
          </div>

          {/* Model Details */}
          {selectedModel ? (
            <ModelDetails
              model={selectedModel}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ) : (
            <div className="card-luxury p-6 flex items-center justify-center text-luxury-400">
              Selecione um modelo para ver os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}