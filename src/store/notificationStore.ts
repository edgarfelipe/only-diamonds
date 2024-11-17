import { create } from 'zustand';

interface NotificationState {
  sendNotification: (data: {
    type: 'like' | 'view' | 'favorite' | 'whatsapp';
    modelName: string;
    modelPhone: string;
    userName?: string;
  }) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  sendNotification: async (data) => {
    try {
      const response = await fetch('https://n8n.servisoft.tech/webhook-test/21917e02-df6f-42d5-b862-d1b1ac430982', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName: data.modelName,
          modelPhone: data.modelPhone,
          type: data.type,
          userName: data.userName || 'Anônimo',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to send notification');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}));