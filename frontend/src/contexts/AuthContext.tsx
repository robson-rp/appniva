import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Profile {
  id: string;
  name: string;
  email: string;
  primary_currency: string;
  monthly_income: number | null;
  onboarding_completed: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, passwordConfirmation?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('me');
      const profileData = response.data;
      setProfile(profileData);
      setUser({
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
      });
      // Admin check logic could be updated if backend returns roles
      setIsAdmin(false); 
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      signOut();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('login', { email, password });
      localStorage.setItem('auth_token', response.access_token);
      
      const profileData = response.user?.data || response.user;
      if (!profileData) throw new Error('Dados do usuário não encontrados');

      setProfile(profileData);
      setUser({
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
      });
      setSession({ access_token: response.access_token });
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string, passwordConfirmation?: string) => {
    try {
      // Backend expects password_confirmation
      const response = await api.post('register', { 
        email, 
        password, 
        password_confirmation: passwordConfirmation || password, 
        name 
      });
      localStorage.setItem('auth_token', response.access_token);
      
      const profileData = response.user?.data || response.user;
      if (!profileData) throw new Error('Dados do usuário não encontrados');

      setProfile(profileData);
      setUser({
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
      });
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    // Backend Socialite not implemented yet
    return { error: new Error('O login com Google ainda não está disponível no backend.') };
  };

  const signOut = async () => {
    try {
      if (localStorage.getItem('auth_token')) {
        await api.post('logout', {});
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await api.post('forgot-password', { email });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!profile) throw new Error('Profile not loaded');
      const response = await api.put(`profiles/${profile.id}`, data);
      setProfile(response.data);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
