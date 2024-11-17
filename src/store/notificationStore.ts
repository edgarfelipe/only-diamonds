import { create } from 'zustand';
import toast from 'react-hot-toast';

interface NotificationPayload {
  type: 'like' | 'view' | 'favorite' | 'whatsapp';
  modelName: string;
  modelPhone: string;
  countryCode?: string;
  userName?: string;
}

interface NotificationState {
  sendNotification: (data: NotificationPayload) => Promise<void>;
}

const WEBHOOK_URL = 'https://n8n.servisoft.tech/webhook-test/21917e02-df6f-42d5-b862-d1b1ac430982';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const formatPhoneNumber = (phone: string, countryCode?: string): string | null => {
  try {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Basic validation
    if (cleaned.length < 8 || cleaned.length > 15) {
      return null;
    }
    
    // Use provided country code or default to international format
    if (countryCode) {
      return `${countryCode}${cleaned}`;
    }
    
    // If no country code provided, assume number is complete
    return cleaned;
  } catch (error) {
    return null;
  }
};

const validateNotificationData = (data: NotificationPayload): void => {
  if (!data.modelName?.trim()) {
    throw new Error('Nome do modelo é obrigatório');
  }

  if (!data.modelPhone?.trim()) {
    throw new Error('Telefone é obrigatório');
  }

  const formattedPhone = formatPhoneNumber(data.modelPhone, data.countryCode);
  if (!formattedPhone) {
    throw new Error('Número de telefone inválido');
  }
};

export const useNotificationStore = create<NotificationState>(() => ({
  sendNotification: async (data: NotificationPayload) => {
    let retries = 0;
    
    const attemptNotification = async (): Promise<Response> => {
      try {
        // Validate data before attempting notification
        validateNotificationData(data);
        
        const formattedPhone = formatPhoneNumber(data.modelPhone, data.countryCode);
        if (!formattedPhone) {
          throw new Error('Número de telefone inválido');
        }

        const payload = {
          modelName: data.modelName.trim(),
          modelPhone: formattedPhone,
          type: data.type,
          userName: data.userName?.trim() || 'Anônimo',
          timestamp: new Date().toISOString()
        };

        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Falha na requisição');
        }

        return response;
      } catch (error) {
        if (retries < MAX_RETRIES && error.message !== 'Número de telefone inválido') {
          retries++;
          await sleep(RETRY_DELAY * retries);
          return attemptNotification();
        }
        throw error;
      }
    };

    try {
      // Skip notification for view events if phone is invalid
      if (data.type === 'view') {
        const formattedPhone = formatPhoneNumber(data.modelPhone, data.countryCode);
        if (!formattedPhone) {
          return; // Silently skip invalid phone numbers for view events
        }
      }

      await attemptNotification();

      // Only show success toast for whatsapp notifications
      if (data.type === 'whatsapp') {
        const formattedPhone = formatPhoneNumber(data.modelPhone, data.countryCode);
        if (formattedPhone) {
          const whatsappUrl = `https://wa.me/${formattedPhone}`;
          window.open(whatsappUrl, '_blank');
          toast.success('Redirecionando para WhatsApp...', {
            duration: 3000,
            position: 'top-center'
          });
        }
      }
    } catch (error: any) {
      // Only show error toast for user-initiated actions
      if (data.type === 'whatsapp' || data.type === 'like' || data.type === 'favorite') {
        toast.error(error.message || 'Erro ao processar solicitação', {
          duration: 4000,
          position: 'top-center'
        });
      }

      // Log the error for monitoring
      console.error('Notification error details:', {
        error: error.message,
        type: data.type,
        retries,
        timestamp: new Date().toISOString()
      });
    }
  }
}));