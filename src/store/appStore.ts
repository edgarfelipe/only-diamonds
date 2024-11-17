import { create } from 'zustand';

type Gender = 'male' | 'female' | null;

interface AppState {
  ageVerified: boolean;
  gender: Gender;
  acceptAgeVerification: () => void;
  setGender: (gender: Gender) => void;
  resetPreferences: () => void;
}

export const useStore = create<AppState>((set) => ({
  ageVerified: false,
  gender: null,
  acceptAgeVerification: () => set({ ageVerified: true }),
  setGender: (gender) => set({ gender }),
  resetPreferences: () => set({ ageVerified: false, gender: null }),
}));