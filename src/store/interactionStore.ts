import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface InteractionState {
  likeProfile: (profileId: string, userId: string) => Promise<void>;
  unlikeProfile: (profileId: string, userId: string) => Promise<void>;
  favoriteProfile: (profileId: string, userId: string) => Promise<void>;
  unfavoriteProfile: (profileId: string, userId: string) => Promise<void>;
  getLikes: (profileId: string) => Promise<number>;
  getFavorites: (profileId: string) => Promise<number>;
  getViews: (profileId: string) => Promise<number>;
  checkIfLiked: (profileId: string, userId?: string) => Promise<boolean>;
  checkIfFavorited: (profileId: string, userId: string) => Promise<boolean>;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  likeProfile: async (profileId: string, userId: string) => {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('curtidor_id', userId)
        .eq('curtido_id', profileId)
        .single();

      if (existingLike) {
        throw new Error('Você já curtiu este perfil');
      }

      const { error } = await supabase
        .from('likes')
        .insert([
          {
            curtidor_id: userId,
            curtido_id: profileId,
            status: 'active'
          }
        ]);

      if (error) throw error;
      toast.success('Perfil curtido!');
    } catch (error: any) {
      console.error('Error liking profile:', error);
      toast.error(error.message || 'Erro ao curtir perfil');
      throw error;
    }
  },

  unlikeProfile: async (profileId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('curtidor_id', userId)
        .eq('curtido_id', profileId);

      if (error) throw error;
      toast.success('Curtida removida');
    } catch (error) {
      console.error('Error unliking profile:', error);
      toast.error('Erro ao remover curtida');
      throw error;
    }
  },

  favoriteProfile: async (profileId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert([
          {
            user_id: userId,
            profile_id: profileId
          }
        ]);

      if (error) throw error;
      toast.success('Adicionado aos favoritos!');
    } catch (error) {
      console.error('Error favoriting profile:', error);
      toast.error('Erro ao adicionar aos favoritos');
      throw error;
    }
  },

  unfavoriteProfile: async (profileId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('profile_id', profileId);

      if (error) throw error;
      toast.success('Removido dos favoritos');
    } catch (error) {
      console.error('Error unfavoriting profile:', error);
      toast.error('Erro ao remover dos favoritos');
      throw error;
    }
  },

  getLikes: async (profileId: string) => {
    try {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('curtido_id', profileId);

      return count || 0;
    } catch (error) {
      console.error('Error getting likes:', error);
      return 0;
    }
  },

  getFavorites: async (profileId: string) => {
    try {
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact' })
        .eq('profile_id', profileId);

      return count || 0;
    } catch (error) {
      console.error('Error getting favorites:', error);
      return 0;
    }
  },

  getViews: async (profileId: string) => {
    try {
      const { count } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact' })
        .eq('profile_id', profileId);

      return count || 0;
    } catch (error) {
      console.error('Error getting views:', error);
      return 0;
    }
  },

  checkIfLiked: async (profileId: string, userId?: string) => {
    if (!userId) return false;
    
    try {
      const { data } = await supabase
        .from('likes')
        .select()
        .eq('curtidor_id', userId)
        .eq('curtido_id', profileId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  checkIfFavorited: async (profileId: string, userId: string) => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }
}));