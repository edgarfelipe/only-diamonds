import React from 'react';
import { useStore } from '../store/appStore';
import { AlertTriangle, Diamond } from 'lucide-react';

export default function AgeVerificationModal() {
  const { acceptAgeVerification } = useStore();

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card-luxury p-6 w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <Diamond className="w-16 h-16 text-gold-400 mb-2" />
          <h2 className="text-2xl font-bold text-center text-gold-400">
            Verificação de Idade
          </h2>
        </div>
        
        <div className="space-y-4 text-luxury-200">
          <p className="font-semibold text-center text-gold-300">
            AVISO: Conteúdo Adulto (18+)
          </p>
          
          <p className="text-center">
            Este site contém conteúdo adulto e é destinado apenas para usuários maiores de 18 anos.
          </p>
          
          <div className="bg-luxury-900/50 border border-luxury-800 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-2 text-gold-400">Políticas do Site:</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Todos os usuários devem ter 18 anos ou mais</li>
              <li>Respeite a privacidade e os limites dos outros usuários</li>
              <li>Conteúdo ou atividades ilegais não são permitidos</li>
              <li>Verificação de perfil obrigatória para criadores de conteúdo</li>
              <li>Todas as transações são seguras e privadas</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={acceptAgeVerification}
            className="w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Confirmo que tenho 18+ anos e aceito os termos
          </button>
          
          <button
            onClick={handleExit}
            className="w-full py-3 px-4 bg-luxury-800 text-gold-400 rounded-lg font-semibold hover:bg-luxury-700 transition"
          >
            Sair do Site
          </button>
        </div>
      </div>
    </div>
  );
}