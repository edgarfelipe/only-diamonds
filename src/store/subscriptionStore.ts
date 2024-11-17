import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { addMonths } from 'date-fns';
import toast from 'react-hot-toast';

interface SubscriptionState {
  checkSubscription: (userId: string) => Promise<boolean>;
  createSubscription: (userId: string, amount: number) => Promise<void>;
  updateSubscription: (userId: string, endDate: Date) => Promise<void>;
  getSubscriptionHistory: (userId: string) => Promise<any[]>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  checkSubscription: async (userId: string) => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('subscription_end')
        .eq('id', userId)
        .single();

      if (!user?.subscription_end) return false;
      return new Date(user.subscription_end) > new Date();
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  },

  createSubscription: async (userId: string, amount: number) => {
    try {
      const endDate = addMonths(new Date(), 1); // 1 month subscription

      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: userId,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString(),
            amount,
            payment_url: 'https://buy.stripe.com/7sI17m7D53k7efC8ww',
            payment_status: 'pending'
          }
        ])
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Update user's subscription end date
      const { error: userError } = await supabase
        .from('users')
        .update({ subscription_end: endDate.toISOString() })
        .eq('id', userId);

      if (userError) throw userError;

      // Create subscription history record
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert([
          {
            subscription_id: subscription.id,
            user_id: userId,
            action: 'create',
            status: 'active',
            amount
          }
        ]);

      if (historyError) throw historyError;

      toast.success('Assinatura criada com sucesso!');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Erro ao criar assinatura');
      throw error;
    }
  },

  updateSubscription: async (userId: string, endDate: Date) => {
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ subscription_end: endDate.toISOString() })
        .eq('id', userId);

      if (userError) throw userError;

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({ 
          end_date: endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (subscriptionError) throw subscriptionError;

      // Create subscription history record
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert([
          {
            user_id: userId,
            action: 'update',
            status: 'active'
          }
        ]);

      if (historyError) throw historyError;

      toast.success('Assinatura atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Erro ao atualizar assinatura');
      throw error;
    }
  },

  getSubscriptionHistory: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }
  }
}));