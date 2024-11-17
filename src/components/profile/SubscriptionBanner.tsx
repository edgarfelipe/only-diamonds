import React from 'react';
import { Gem, AlertTriangle } from 'lucide-react';

interface SubscriptionBannerProps {
  status: 'trial' | 'active' | 'expired';
  daysRemaining?: number;
  onSubscribe: () => void;
}

export default function SubscriptionBanner({ status, daysRemaining, onSubscribe }: SubscriptionBannerProps) {
  if (status === 'active') return null;

  return (
    <div className={`p-4 rounded-lg mb-4 ${
      status === 'trial' 
        ? 'bg-gold-400/10 border border-gold-400/20' 
        : 'bg-red-400/10 border border-red-400/20'
    }`}>
      <div className="flex items-center gap-2">
        {status === 'trial' ? (
          <Gem className="w-5 h-5 text-gold-400" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-400" />
        )}
        <div className="flex-1">
          <p className={`font-medium ${
            status === 'trial' ? 'text-gold-400' : 'text-red-400'
          }`}>
            {status === 'trial' 
              ? `Período de teste: ${daysRemaining} dias restantes`
              : 'Sua assinatura expirou'}
          </p>
          <p className="text-sm text-luxury-300">
            {status === 'trial'
              ? 'Assine agora para continuar aproveitando todos os benefícios'
              : 'Renove sua assinatura para reativar seu perfil'}
          </p>
        </div>
        <button
          onClick={onSubscribe}
          className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Assinar Agora
        </button>
      </div>
    </div>
  );
}