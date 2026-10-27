import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from './supabase';
import type { Profile, Role } from './types';

type AuthState = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  /** Sends a 6-digit SMS code. Phone in local form like 771234567. */
  sendOtp: (localPhone: string) => Promise<void>;
  verifyOtp: (localPhone: string, code: string) => Promise<Profile>;
  /** Demo only: jump straight in as a citizen or driver. */
  demoSignIn: (role: Role) => Profile;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function toE164(localPhone: string): string {
  const digits = localPhone.replace(/\D/g, '').replace(/^0/, '').replace(/^94/, '');
  return `+94${digits}`;
}

function demoProfile(role: Role): Profile {
  return {
    id: role === 'driver' ? 'demo-driver' : 'demo-citizen',
    full_name: role === 'driver' ? 'Ruwan Perera' : 'Dilini',
    phone: '+94771234567',
    role,
    council_id: 'c1',
    language: 'si',
    truck_no: role === 'driver' ? 'WP LK-4521' : null,
    points: 120,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile((data as Profile) ?? null);
    return data as Profile;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      profile,
      sendOtp: async (localPhone) => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.auth.signInWithOtp({ phone: toE164(localPhone) });
        if (error) throw error;
      },
      verifyOtp: async (localPhone, code) => {
        if (!isSupabaseConfigured) {
          const p = demoProfile('citizen');
          setProfile(p);
          return p;
        }
        const { data, error } = await supabase.auth.verifyOtp({ phone: toE164(localPhone), token: code, type: 'sms' });
        if (error || !data.user) throw error ?? new Error('Could not sign in');
        return loadProfile(data.user.id);
      },
      demoSignIn: (role) => {
        const p = demoProfile(role);
        setProfile(p);
        return p;
      },
      signOut: async () => {
        if (isSupabaseConfigured) await supabase.auth.signOut();
        setProfile(null);
      },
      refreshProfile: async () => {
        if (session) await loadProfile(session.user.id);
      },
    }),
    [loading, session, profile, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function homeFor(role: Role): '/home' | '/jobs' {
  return role === 'driver' ? '/jobs' : '/home';
}
