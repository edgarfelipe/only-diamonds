import React, { useEffect, useState } from 'react';
import { useStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import ProfileCard from './components/ProfileCard';
import AgeVerificationModal from './components/AgeVerificationModal';
import GenderSelectionModal from './components/GenderSelectionModal';
import FemaleRegistration from './components/FemaleRegistration';
import AdminPanel from './components/AdminPanel';
import WaitingApproval from './components/WaitingApproval';
import ModelProfile from './components/ModelProfile';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import MaleProfile from './components/MaleProfile';

interface ModelProfile {
  id: string;
  nome: string;
  idade?: number;
  localizacao?: string;
  bio?: string;
  foto_perfil?: string;
  fotos?: string[];
  whatsapp?: string;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(0);
  const [modelProfiles, setModelProfiles] = useState<ModelProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { ageVerified, gender, setGender } = useStore();
  const { user } = useAuthStore();

  // Load approved model profiles
  useEffect(() => {
    const loadModelProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'model')
          .eq('status', 'approved')
          .eq('genero', 'female');

        if (error) throw error;
        setModelProfiles(data || []);
      } catch (error) {
        console.error('Error loading model profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (gender === 'male') {
      loadModelProfiles();
    }
  }, [gender]);

  // Set gender based on user role when logged in
  useEffect(() => {
    if (user) {
      setGender(user.role === 'model' ? 'female' : 'male');
    }
  }, [user, setGender]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!ageVerified) {
    return <AgeVerificationModal />;
  }

  if (!user && !gender) {
    return <GenderSelectionModal />;
  }

  if (user?.role === 'model') {
    if (user.status === 'pending') {
      return <WaitingApproval />;
    }
    
    if (user.status === 'approved') {
      return <ModelProfile />;
    }
  }

  if (gender === 'female' && !user) {
    return <FemaleRegistration onBack={() => setGender(null)} />;
  }

  if (user?.role === 'admin') {
    return <AdminPanel />;
  }

  if (user?.role === 'user' && user?.genero === 'male') {
    return <MaleProfile />;
  }

  return (
    <div className="min-h-screen bg-luxury-950 transition-colors">
      <Toaster position="top-center" />
      <Header />

      <main className="max-w-md mx-auto px-4 py-6 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {loading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-400 border-t-transparent"></div>
          </div>
        ) : modelProfiles.length > 0 ? (
          currentProfile < modelProfiles.length ? (
            <ProfileCard
              {...modelProfiles[currentProfile]}
              distance="Próximo a você"
              onLike={() => {
                if (currentProfile < modelProfiles.length - 1) {
                  setCurrentProfile(prev => prev + 1);
                }
              }}
              onPass={() => {
                if (currentProfile < modelProfiles.length - 1) {
                  setCurrentProfile(prev => prev + 1);
                }
              }}
              onPrevious={() => {
                if (currentProfile > 0) {
                  setCurrentProfile(prev => prev - 1);
                }
              }}
              hasMore={currentProfile < modelProfiles.length - 1}
              hasPrevious={currentProfile > 0}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-luxury-300">Não há mais perfis para mostrar.</p>
              <button
                onClick={() => setCurrentProfile(0)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg hover:opacity-90 transition"
              >
                Recomeçar
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-luxury-300">Nenhum perfil encontrado.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;