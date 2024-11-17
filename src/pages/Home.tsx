import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      const { data, error } = await supabase
        .from('users')
        .select('*')
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

            {/* Navigation Controls */}
            <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 1000 }}>
              <div className="container max-w-6xl mx-auto px-4 flex justify-between pointer-events-none">
                {currentProfile > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="pointer-events-auto p-4 bg-black/50 rounded-full text-white hover:bg-black/70 transition transform hover:scale-105"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}
                {currentProfile < modelProfiles.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="pointer-events-auto p-4 bg-black/50 rounded-full text-white hover:bg-black/70 transition transform hover:scale-105 ml-auto"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}
              </div>
            </div>

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