import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  requestPasswordReset: (userId: string, reason?: string) => Promise<{ error: any }>;
  checkIsAdmin: () => Promise<boolean>;
  checkIsSuperAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cache for admin checks to prevent excessive RPC calls
  const adminCacheRef = useRef<{ isAdmin: boolean | null; isSuperAdmin: boolean | null; timestamp: number }>({
    isAdmin: null,
    isSuperAdmin: null,
    timestamp: 0
  });
  const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const requestPasswordReset = async (userId: string, reason?: string) => {
    const { error } = await supabase
      .from('password_reset_requests')
      .insert({
        user_id: userId,
        requested_by: user?.id || '',
        reason: reason || null,
      });
    return { error };
  };

  const checkIsAdmin = async (): Promise<boolean> => {
    const now = Date.now();
    if (adminCacheRef.current.isAdmin !== null && (now - adminCacheRef.current.timestamp) < ADMIN_CACHE_TTL) {
      return adminCacheRef.current.isAdmin;
    }

    const { data } = await supabase.rpc('is_admin');
    adminCacheRef.current.isAdmin = !!data;
    adminCacheRef.current.timestamp = now;
    return !!data;
  };

  const checkIsSuperAdmin = async (): Promise<boolean> => {
    const now = Date.now();
    if (adminCacheRef.current.isSuperAdmin !== null && (now - adminCacheRef.current.timestamp) < ADMIN_CACHE_TTL) {
      return adminCacheRef.current.isSuperAdmin;
    }

    const { data } = await supabase.rpc('is_super_admin');
    adminCacheRef.current.isSuperAdmin = !!data;
    adminCacheRef.current.timestamp = now;
    return !!data;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updatePassword,
    requestPasswordReset,
    checkIsAdmin,
    checkIsSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};