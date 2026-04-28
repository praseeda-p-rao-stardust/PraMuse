import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  trust_score: number;
};

export type Skill = {
  id: string;
  title: string;
  seeking: string;
  category: string;
  level: string;
  availability: string | null;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    trust_score: number;
  };
};

export type SwapRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
  offered_skill: { id: string; title: string };
  requested_skill: { id: string; title: string };
};

export type Message = {
  id: string;
  swap_id: string;
  sender_id: string;
  text: string;
  sent_at: string;
  sender: { id: string; name: string; avatar: string | null };
};

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  // API actions
  login: (email: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; avatar: string }) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, name: string) => {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
        if (!res.ok) throw new Error('Login failed');
        const user = await res.json();
        set({ user, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;
        const res = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, email: user.email }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Update failed');
        set({ user: { ...user, ...json } });
      },
    }),
    { name: 'pramuse-storage' }
  )
);
