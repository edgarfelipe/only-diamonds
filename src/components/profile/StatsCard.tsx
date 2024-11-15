import React from 'react';
import { DollarSign, Heart, MessageCircle, Users } from 'lucide-react';

export default function StatsCard() {
  const stats = [
    {
      icon: Heart,
      label: 'Curtidas',
      value: '2.5K',
      color: 'text-pink-500'
    },
    {
      icon: MessageCircle,
      label: 'Mensagens',
      value: '89',
      color: 'text-purple-500'
    },
    {
      icon: Users,
      label: 'Assinantes',
      value: '32',
      color: 'text-blue-500'
    },
    {
      icon: DollarSign,
      label: 'Ganhos',
      value: '€1,234',
      color: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`inline-flex p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {stat.value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}