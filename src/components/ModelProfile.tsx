import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Camera, Heart, MessageCircle, Settings, LogOut, 
  Edit, Trash2, Plus, X, DollarSign, Users, Image,
  ChevronRight, Lock, Bell, HelpCircle, Shield, Diamond,
  Gem, Star, Video, Loader
} from 'lucide-react';
import { supabase, getPublicUrl } from '../lib/supabase';
import toast from 'react-hot-toast';
import EditProfileModal from './profile/EditProfileModal';
import PhotoGallery from './profile/PhotoGallery';
import DeleteAccountModal from './profile/DeleteAccountModal';
import SettingsModal from './profile/SettingsModal';
import SubscriptionBanner from './profile/SubscriptionBanner';
import ProfileHeader from './profile/ProfileHeader';
import { differenceInDays } from 'date-fns';

export default function ModelProfile() {
  const { user, signOut, updateUser } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'fotos' | 'videos' | 'stats' | 'settings'>('fotos');
  const [isUploading, setIsUploading] = useState(false);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, total: 0 });
  const [stats, setStats] = useState({ likes: 0, views: 0, messages: 0 });

  useEffect(() => {
    loadStats();
    loadEarnings();
  }, []);

  const loadStats = async () => {
    try {
      const { data: likes } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('curtido_id', user?.id);

      const { data: messages } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('receiver_id', user?.id);

      const { data: views } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact' })
        .eq('profile_id', user?.id);

      setStats({
        likes: likes?.length || 0,
        messages: messages?.length || 0,
        views: views?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadEarnings = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
      const startOfMonth = new Date(now.setDate(1)).toISOString();

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('model_id', user?.id);

      if (transactions) {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        const today = transactions.filter(t => t.created_at >= startOfDay)
          .reduce((sum, t) => sum + t.amount, 0);
        const week = transactions.filter(t => t.created_at >= startOfWeek)
          .reduce((sum, t) => sum + t.amount, 0);
        const month = transactions.filter(t => t.created_at >= startOfMonth)
          .reduce((sum, t) => sum + t.amount, 0);

        setEarnings({ today, week, month, total });
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const handleFileUpload = async (files: FileList, type: 'photo' | 'video') => {
    if (!files.length) return;

    const maxFiles = type === 'photo' ? 20 : 3;
    const maxSize = type === 'photo' ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
    const existingFiles = type === 'photo' ? user?.fotos?.length || 0 : user?.videos?.length || 0;
    
    if (files.length + existingFiles > maxFiles) {
      toast.error(`Máximo de ${maxFiles} ${type === 'photo' ? 'fotos' : 'vídeos'} permitido`);
      return;
    }

    setIsUploading(true);
    try {
      const newFiles = [];
      for (const file of Array.from(files)) {
        if (file.size > maxSize) {
          throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${type === 'photo' ? 'photos' : 'videos'}/${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('only-diamonds')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;
        newFiles.push(filePath);
      }

      const updateField = type === 'photo' ? 'fotos' : 'videos';
      const existingMediaFiles = user?.[updateField] || [];

      const { error: updateError } = await supabase
        .from('users')
        .update({
          [updateField]: [...existingMediaFiles, ...newFiles]
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      updateUser({
        ...user!,
        [updateField]: [...existingMediaFiles, ...newFiles]
      });

      toast.success(`${type === 'photo' ? 'Fotos' : 'Vídeos'} adicionados com sucesso!`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || `Erro ao adicionar ${type === 'photo' ? 'fotos' : 'vídeos'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    toast.success('Sessão encerrada com sucesso');
  };

  const getSubscriptionStatus = () => {
    if (!user?.subscription_end) {
      const createdAt = new Date(user?.created_at || '');
      const daysElapsed = differenceInDays(new Date(), createdAt);
      if (daysElapsed < 7) return 'trial';
      return 'expired';
    }

    const endDate = new Date(user.subscription_end);
    return endDate > new Date() ? 'active' : 'expired';
  };

  const getDaysRemaining = () => {
    if (!user?.created_at) return 0;
    const createdAt = new Date(user.created_at);
    const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysRemaining = differenceInDays(trialEnd, new Date());
    return Math.max(0, daysRemaining);
  };

  const handleSubscribe = () => {
    window.open('https://buy.stripe.com/7sI17m7D53k7efC8ww', '_blank');
  };

  const profileUrl = user?.foto_perfil ? getPublicUrl('only-diamonds', user.foto_perfil) : null;
  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-luxury-950">
      <div className="max-w-lg mx-auto px-4 py-6">
        <ProfileHeader onLogout={handleLogout} />

        <SubscriptionBanner
          status={subscriptionStatus}
          daysRemaining={subscriptionStatus === 'trial' ? getDaysRemaining() : undefined}
          onSubscribe={handleSubscribe}
        />

        {/* Profile Info */}
        <div className="card-luxury p-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full mx-auto relative group">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={user?.nome}
                  className="w-full h-full rounded-full object-cover border-4 border-gold-400"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-luxury-800 flex items-center justify-center border-4 border-gold-400">
                  <Camera className="w-8 h-8 text-gold-400" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer p-2">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files!, 'photo')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 p-2 rounded-full bg-gold-500 text-luxury-950 hover:bg-gold-400 transition"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Diamond className="w-5 h-5 text-gold-400" />
              <h1 className="text-xl font-bold text-gold-400">
                {user?.nome}
              </h1>
            </div>
            <p className="text-luxury-300 mt-1">
              {user?.localizacao}
            </p>
            {user?.bio && (
              <p className="mt-2 text-sm text-luxury-200">
                {user.bio}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gold-400" />
              </div>
              <p className="mt-2 text-xl font-bold text-gold-400">€{earnings.today}</p>
              <p className="text-xs text-luxury-400">Hoje</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center">
                <Heart className="w-6 h-6 text-gold-400" />
              </div>
              <p className="mt-2 text-xl font-bold text-gold-400">{stats.likes}</p>
              <p className="text-xs text-luxury-400">Curtidas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gold-400" />
              </div>
              <p className="mt-2 text-xl font-bold text-gold-400">{stats.messages}</p>
              <p className="text-xs text-luxury-400">Mensagens</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center">
                <Users className="w-6 h-6 text-gold-400" />
              </div>
              <p className="mt-2 text-xl font-bold text-gold-400">{stats.views}</p>
              <p className="text-xs text-luxury-400">Visualizações</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-luxury-900/30 border-b border-luxury-800 -mx-4 px-4">
          <div className="flex justify-between">
            <button
              onClick={() => setActiveTab('fotos')}
              className={`py-3 px-4 border-b-2 transition ${
                activeTab === 'fotos'
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-luxury-400 hover:text-gold-200'
              }`}
            >
              Fotos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-3 px-4 border-b-2 transition ${
                activeTab === 'videos'
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-luxury-400 hover:text-gold-200'
              }`}
            >
              Vídeos
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 border-b-2 transition ${
                activeTab === 'stats'
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-luxury-400 hover:text-gold-200'
              }`}
            >
              Estatísticas
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-4 border-b-2 transition ${
                activeTab === 'settings'
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-luxury-400 hover:text-gold-200'
              }`}
            >
              Configurações
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="py-6">
          {activeTab === 'fotos' && (
            <div className="space-y-6">
              {/* Upload Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gold-400 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Minhas Fotos
                </h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-luxury-950 rounded-lg hover:bg-gold-400 transition cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files!, 'photo')}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              <PhotoGallery
                photos={user?.fotos || []}
                onDelete={(url) => handleFileUpload(new FileList(), 'photo')}
                isLoading={isUploading}
              />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Upload Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gold-400 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Meus Vídeos
                </h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-luxury-950 rounded-lg hover:bg-gold-400 transition cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e.target.files!, 'video')}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {user?.videos?.map((video, index) => {
                  const videoUrl = getPublicUrl('only-diamonds', video);
                  if (!videoUrl) return null;

                  return (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                      <video
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleFileUpload(new FileList(), 'video')}
                          className="absolute bottom-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform translate-y-full group-hover:translate-y-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {(!user?.videos || user.videos.length < 3) && (
                  <label className="aspect-video rounded-lg bg-luxury-900/50 flex items-center justify-center cursor-pointer hover:bg-luxury-800/50 transition border-2 border-dashed border-luxury-800 group">
                    <div className="text-center">
                      <Video className="w-8 h-8 text-gold-400 mx-auto group-hover:scale-110 transition-transform" />
                      <span className="mt-2 text-sm text-luxury-400 block">Adicionar Vídeo</span>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e.target.files!, 'video')}
                      className="hidden"
                      multiple={!user?.videos || user.videos.length === 0}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Earnings Card */}
              <div className="card-luxury p-6">
                <h3 className="text-lg font-semibold text-gold-400 flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5" />
                  Ganhos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-luxury-800/50 rounded-lg">
                    <p className="text-sm text-luxury-400">Hoje</p>
                    <p className="text-xl font-bold text-gold-400">€{earnings.today}</p>
                  </div>
                  <div className="p-4 bg-luxury-800/50 rounded-lg">
                    <p className="text-sm text-luxury-400">Esta Semana</p>
                    <p className="text-xl font-bold text-gold-400">€{earnings.week}</p>
                  </div>
                  <div className="p-4 bg-luxury-800/50 rounded-lg">
                    <p className="text-sm text-luxury-400">Este Mês</p>
                    <p className="text-xl font-bold text-gold-400">€{earnings.month}</p>
                  </div>
                  <div className="p-4 bg-luxury-800/50 rounded-lg">
                    <p className="text-sm text-luxury-400">Total</p>
                    <p className="text-xl font-bold text-gold-400">€{earnings.total}</p>
                  </div>
                </div>
              </div>

              {/* Interaction Stats */}
              <div className="card-luxury p-6">
                <h3 className="text-lg font-semibold text-gold-400 flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5" />
                  Interações
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center mb-2">
                      <Heart className="w-6 h-6 text-gold-400" />
                    </div>
                    <p className="text-xl font-bold text-gold-400">{stats.likes}</p>
                    <p className="text-sm text-luxury-400">Curtidas</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center mb-2">
                      <MessageCircle className="w-6 h-6 text-gold-400" />
                    </div>
                    <p className="text-xl font-bold text-gold-400">{stats.messages}</p>
                    <p className="text-sm text-luxury-400">Mensagens</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-luxury-800 flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-gold-400" />
                    </div>
                    <p className="text-xl font-bold text-gold-400">{stats.views}</p>
                    <p className="text-sm text-luxury-400">Visualizações</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="card-luxury divide-y divide-luxury-800">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-luxury-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Edit className="w-5 h-5 text-gold-400" />
                    <span className="text-luxury-100">Editar Perfil</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-luxury-400" />
                </button>

                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-luxury-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gold-400" />
                    <span className="text-luxury-100">Privacidade</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-luxury-400" />
                </button>

                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-luxury-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gold-400" />
                    <span className="text-luxury-100">Notificações</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-luxury-400" />
                </button>

                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-luxury-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-gold-400" />
                    <span className="text-luxury-100">Ajuda e Suporte</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-luxury-400" />
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-luxury-800/50 transition text-red-400"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5" />
                    <span>Excluir Conta</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {isUploading && (
        <div className="fixed inset-0 bg-luxury-950/80 flex items-center justify-center z-50">
          <Loader className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      )}
    </div>
  );
}