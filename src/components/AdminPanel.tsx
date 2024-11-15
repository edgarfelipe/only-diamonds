import React, { useEffect, useState } from 'react';
import { supabase, getPublicUrl } from '../lib/supabase';
import { Diamond, Heart, Star, Users, Eye, Check, X, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageViewer from './ImageViewer';

interface PendingProfile {
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
}

interface ModelStats {
  id: string;
  nome: string;
  foto_perfil?: string;
  likes: number;
  views: number;
  favorites: number;
}

export default function AdminPanel() {
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [modelRankings, setModelRankings] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'rankings'>('pending');
  const [selectedProfile, setSelectedProfile] = useState<PendingProfile | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    loadPendingProfiles();
    loadModelRankings();
  }, []);

  const loadPendingProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'pending')
        .eq('role', 'model')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingProfiles(data || []);
    } catch (error) {
      console.error('Error loading pending profiles:', error);
      toast.error('Erro ao carregar perfis pendentes');
    } finally {
      setLoading(false);
    }
  };

  const loadModelRankings = async () => {
    try {
      const { data: models, error: modelsError } = await supabase
        .from('users')
        .select('id, nome, foto_perfil')
        .eq('role', 'model')
        .eq('status', 'approved');

      if (modelsError) throw modelsError;

      const modelStats = await Promise.all(
        (models || []).map(async (model) => {
          const [likes, views, favorites] = await Promise.all([
            supabase.from('likes').select('*', { count: 'exact' }).eq('curtido_id', model.id),
            supabase.from('profile_views').select('*', { count: 'exact' }).eq('profile_id', model.id),
            supabase.from('favorites').select('*', { count: 'exact' }).eq('profile_id', model.id),
          ]);

          return {
            ...model,
            likes: likes.count || 0,
            views: views.count || 0,
            favorites: favorites.count || 0,
          };
        })
      );

      setModelRankings(modelStats.sort((a, b) => b.likes - a.likes));
    } catch (error) {
      console.error('Error loading model rankings:', error);
      toast.error('Erro ao carregar rankings');
    }
  };

  const handleApproval = async (userId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', userId);

      if (error) throw error;

      toast.success(approved ? 'Perfil aprovado com sucesso!' : 'Perfil rejeitado');
      await loadPendingProfiles();
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error updating profile status:', error);
      toast.error('Erro ao atualizar status do perfil');
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!selectedProfile?.fotos) return;

    const maxIndex = selectedProfile.fotos.length - 1;
    if (direction === 'prev') {
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
    } else {
      setCurrentImageIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    }
  };

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
        <div className="flex items-center gap-2 mb-6">
          <Diamond className="w-8 h-8 text-gold-400" />
          <h1 className="text-2xl font-bold text-gold-400">Painel Administrativo</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-luxury-800">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-2 px-1 text-sm font-medium transition ${
              activeTab === 'pending'
                ? 'text-gold-400 border-b-2 border-gold-400'
                : 'text-luxury-400 hover:text-gold-200'
            }`}
          >
            Aprovações Pendentes
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`pb-2 px-1 text-sm font-medium transition ${
              activeTab === 'rankings'
                ? 'text-gold-400 border-b-2 border-gold-400'
                : 'text-luxury-400 hover:text-gold-200'
            }`}
          >
            Ranking de Modelos
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Profiles List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gold-400 mb-4">
                Perfis Aguardando Aprovação
              </h2>
              
              {pendingProfiles.length === 0 ? (
                <div className="text-center py-12 text-luxury-400">
                  Nenhum perfil pendente para análise
                </div>
              ) : (
                pendingProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`card-luxury p-4 cursor-pointer transition ${
                      selectedProfile?.id === profile.id ? 'border-gold-400' : ''
                    }`}
                    onClick={() => {
                      setSelectedProfile(profile);
                      setCurrentImageIndex(0);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {profile.foto_perfil && (
                        <img
                          src={getPublicUrl('only-diamonds', profile.foto_perfil)}
                          alt={profile.nome}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gold-400">{profile.nome}</h3>
                        <p className="text-sm text-luxury-300">{profile.email}</p>
                        <p className="text-xs text-luxury-400">
                          Cadastro: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-luxury-400" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Profile Review */}
            {selectedProfile && (
              <div className="card-luxury p-6">
                <h3 className="text-xl font-semibold text-gold-400 mb-4">
                  Análise de Perfil
                </h3>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <p><span className="text-gold-400">Nome:</span> {selectedProfile.nome}</p>
                    <p><span className="text-gold-400">Idade:</span> {selectedProfile.idade} anos</p>
                    <p><span className="text-gold-400">Localização:</span> {selectedProfile.localizacao}</p>
                    <p><span className="text-gold-400">WhatsApp:</span> {selectedProfile.whatsapp}</p>
                    {selectedProfile.bio && (
                      <div>
                        <span className="text-gold-400">Bio:</span>
                        <p className="text-sm text-luxury-200 mt-1">{selectedProfile.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Document Review */}
                  {selectedProfile.documento && (
                    <div>
                      <h4 className="text-gold-400 font-medium mb-2">Documento de Identificação</h4>
                      <div className="relative aspect-[3/2] bg-luxury-900 rounded-lg overflow-hidden">
                        <img
                          src={getPublicUrl('only-diamonds', selectedProfile.documento)}
                          alt="Documento"
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => setFullscreenImage(getPublicUrl('only-diamonds', selectedProfile.documento)!)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Photo Review */}
                  {selectedProfile.fotos && selectedProfile.fotos.length > 0 && (
                    <div>
                      <h4 className="text-gold-400 font-medium mb-2">Fotos ({currentImageIndex + 1}/{selectedProfile.fotos.length})</h4>
                      <div className="relative aspect-square bg-luxury-900 rounded-lg overflow-hidden">
                        <img
                          src={getPublicUrl('only-diamonds', selectedProfile.fotos[currentImageIndex])}
                          alt={`Foto ${currentImageIndex + 1}`}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => setFullscreenImage(getPublicUrl('only-diamonds', selectedProfile.fotos![currentImageIndex])!)}
                        />
                        
                        {selectedProfile.fotos.length > 1 && (
                          <>
                            <button
                              onClick={() => handleImageNavigation('prev')}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-luxury-900/80 text-gold-400 hover:bg-luxury-800"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={() => handleImageNavigation('next')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-luxury-900/80 text-gold-400 hover:bg-luxury-800"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Approval Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleApproval(selectedProfile.id, true)}
                      className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleApproval(selectedProfile.id, false)}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="grid gap-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-luxury-800">
                    <th className="text-left py-3 px-4 text-gold-400 font-medium">Modelo</th>
                    <th className="text-center py-3 px-4 text-gold-400 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="w-4 h-4" />
                        Curtidas
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-gold-400 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4" />
                        Favoritos
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-gold-400 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4" />
                        Visualizações
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modelRankings.map((model, index) => (
                    <tr key={model.id} className="border-b border-luxury-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {index < 3 && (
                            <div className="w-6 h-6 rounded-full bg-luxury-900 flex items-center justify-center">
                              <span className="text-gold-400 text-sm font-medium">{index + 1}</span>
                            </div>
                          )}
                          {model.foto_perfil && (
                            <img
                              src={getPublicUrl('only-diamonds', model.foto_perfil)}
                              alt={model.nome}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <span className="text-luxury-200">{model.nome}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-luxury-200">{model.likes}</td>
                      <td className="text-center py-3 px-4 text-luxury-200">{model.favorites}</td>
                      <td className="text-center py-3 px-4 text-luxury-200">{model.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </div>
  );
}