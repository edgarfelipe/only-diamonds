import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Gender = 'male' | 'female' | null;

interface AppState {
  ageVerified: boolean;
  gender: Gender;
  acceptAgeVerification: () => void;
  setGender: (gender: Gender) => void;
  resetPreferences: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ageVerified: false,
      gender: null,
      acceptAgeVerification: () => set({ ageVerified: true }),
      setGender: (gender) => set({ gender }),
      resetPreferences: () => set({ ageVerified: false, gender: null }),
    }),
    {
      name: 'app-storage',
    }
  )
);