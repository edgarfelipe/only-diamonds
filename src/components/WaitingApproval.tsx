import React from 'react';
import { Clock } from 'lucide-react';

export default function WaitingApproval() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
          <Clock className="w-10 h-10 text-pink-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Perfil em Análise
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Seu cadastro está sendo analisado pela nossa equipe. 
          Você receberá um email assim que seu perfil for aprovado.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h2 className="font-medium text-gray-900 dark:text-white mb-2">
              Próximos Passos:
            </h2>
            <ul className="text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
              <li>• Verificação de documentos</li>
              <li>• Validação das informações</li>
              <li>• Aprovação do perfil</li>
              <li>• Ativação da conta</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tempo médio de aprovação: 24-48 horas
          </p>
        </div>
      </div>
    </div>
  );
}