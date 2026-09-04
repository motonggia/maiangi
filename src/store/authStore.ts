import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'STUDENT' | 'PARENT' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone1: string;
  phone2: string;
  schoolId: string;
  classId: string;
  isApproved: boolean;
  parentId?: string; // For students
  studentId?: string; // For parents
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'maiangi-online-auth',
    }
  )
);
