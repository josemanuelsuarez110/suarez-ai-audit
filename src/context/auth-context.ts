import { createContext } from 'react';
import { type User, type Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'auditor' | 'viewer';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
