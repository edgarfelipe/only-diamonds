import React from 'react';
import { X, Bell, Lock, Shield, DollarSign } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-md card-luxury">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-luxury-400 hover:text-gold-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gold-400 mb-6">
            Configurações
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gold-400 mb-4">
                <Lock className="w-5 h-5" />
                Privacidade
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Perfil Privado</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Mostrar Localização</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" defaultChecked />
                </label>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gold-400 mb-4">
                <Bell className="w-5 h-5" />
                Notificações
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Novas Mensagens</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Novos Seguidores</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Atualizações do Sistema</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" defaultChecked />
                </label>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gold-400 mb-4">
                <DollarSign className="w-5 h-5" />
                Pagamentos
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Notificações de Pagamento</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Relatórios Automáticos</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" />
                </label>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gold-400 mb-4">
                <Shield className="w-5 h-5" />
                Segurança
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Autenticação em 2 Fatores</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-luxury-200">Alertas de Login</span>
                  <input type="checkbox" className="toggle bg-luxury-800 checked:bg-gold-400" defaultChecked />
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}