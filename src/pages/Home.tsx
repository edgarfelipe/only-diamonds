import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';

interface ModelProfile {
  id: string;
  nome: string;
  idade?: number;
  localizacao?: string;
  bio?: string;
  foto_perfil?: string;
  fotos?: string[];
  whatsapp?: string;
  altura?: string;
  medidas?: string;
  atende?: string;
  horario?: string;
  idiomas?: string[];
}

export default function Home() {
  const [currentProfile, setCurrentProfile] = useState(0);
  const [modelProfiles, setModelProfiles] = useState<ModelProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelProfiles();
  }, []);

  const loadModelProfiles = async () => {
    try {
      // Check if user is already logged in as a model
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const { state } = JSON.parse(authData);
          if (state?.user?.role === 'model') {
            window.location.href = '/profile';
            return;
          }
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, nome, idade, localizacao, bio, foto_perfil, fotos, whatsapp, altura, medidas, atende, horario, idiomas')
        .eq('role', 'model')
        .eq('status', 'approved')
        .eq('genero', 'female');

      if (error) throw error;
      
      // Filter out profiles without photos
      const validProfiles = (data || []).filter(profile => 
        profile.foto_perfil && profile.fotos?.length > 0
      );
      
      setModelProfiles(validProfiles);
    } catch (error) {
      console.error('Error loading model profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentProfile > 0) {
      setCurrentProfile(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentProfile < modelProfiles.length - 1) {
      setCurrentProfile(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-950 transition-colors">
      <Header />

      <main className="max-w-md mx-auto px-4 py-6 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {loading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-400 border-t-transparent"></div>
          </div>
        ) : modelProfiles.length > 0 ? (
          <div className="relative h-[70vh]">
            {currentProfile < modelProfiles.length && (
              <ProfileCard
                {...modelProfiles[currentProfile]}
                onLike={handleNext}
                onPass={handleNext}
                onPrevious={handlePrevious}
                hasMore={currentProfile < modelProfiles.length - 1}
                hasPrevious={currentProfile > 0}
              />
            )}

            {currentProfile >= modelProfiles.length && (
              <div className="text-center py-12">
                <p className="text-luxury-300">Não há mais perfis para mostrar.</p>
                <button
                  onClick={() => setCurrentProfile(0)}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg hover:opacity-90 transition"
                >
                  Recomeçar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-luxury-300">Nenhum perfil encontrado.</p>
          </div>
        )}
      </main>
    </div>
  );
}