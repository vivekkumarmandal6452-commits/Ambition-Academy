import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | Profile | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
  isInstructor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      if (data.success && data.data) {
        const fetchedProfile = data.data;
        if (fetchedProfile.email?.toLowerCase() === 'ambitionacademy00@gmail.com') {
          fetchedProfile.role = 'admin';
        }
        setProfile(fetchedProfile);
        setUser(prev => prev || fetchedProfile);
      }
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const initAuth = async () => {
      // 1. Check local token first
      const localToken = localStorage.getItem('ambition_token');
      if (localToken) {
        await fetchProfile();
      }

      // 2. Check Supabase session if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (isSubscribed && session) {
            setSession(session);
            setUser(session.user);
            await fetchProfile();
          }
        } catch {
          // Ignore Supabase connection error
        }
      }

      if (isSubscribed) setLoading(false);
    };

    initAuth();

    let subscription: any = null;
    if (isSupabaseConfigured()) {
      try {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isSubscribed) return;
          setSession(session);
          if (session?.user) {
            setUser(session.user);
            await fetchProfile();
          } else if (!localStorage.getItem('ambition_token')) {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });
        subscription = data.subscription;
      } catch {}
    }

    return () => {
      isSubscribed = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/api/auth/register', { email, password, name });
      if (response.data.success && response.data.data) {
        const { token, user: profileData } = response.data.data;
        if (token) localStorage.setItem('ambition_token', token);
        setProfile(profileData);
        setUser(profileData);
        return;
      }
      throw new Error(response.data.error || 'Registration failed');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.success && response.data.data) {
        const { token, user: profileData } = response.data.data;
        if (token) localStorage.setItem('ambition_token', token);
        if (email.trim().toLowerCase() === 'ambitionacademy00@gmail.com') {
          profileData.role = 'admin';
        }
        setProfile(profileData);
        setUser(profileData);
        return;
      }
      throw new Error(response.data.error || 'Invalid credentials');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('ambition_token');
    if (isSupabaseConfigured()) {
      try { await supabase.auth.signOut(); } catch {}
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } else {
      throw new Error('Password reset requires active email provider.');
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const response = await api.put('/api/auth/profile', data);
    if (response.data.success) setProfile(response.data.data);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signUp, signIn, signOut, resetPassword, updateProfile,
      isAdmin: profile?.role === 'admin',
      isInstructor: profile?.role === 'instructor' || profile?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
