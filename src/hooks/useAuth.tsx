import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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

// Module-level admin cache (singleton) to prevent duplicate checks across components
const adminCache = {
  isAdmin: null as boolean | null,
  isSuperAdmin: null as boolean | null,
  timestamp: 0
};

// Track in-flight admin check promises to deduplicate concurrent calls
let adminCheckPromise: Promise<boolean> | null = null;
let superAdminCheckPromise: Promise<boolean> | null = null;

const ADMIN_CACHE_TTL = 30 * 60 * 1000; // 30 minutes (single-user app, safe to cache longer)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
    // If already checking, return the same promise to deduplicate concurrent calls
    if (adminCheckPromise) return adminCheckPromise;

    const now = Date.now();
    if (adminCache.isAdmin !== null && (now - adminCache.timestamp) < ADMIN_CACHE_TTL) {
      return adminCache.isAdmin;
    }

    // Start new check and store promise for deduplication
    adminCheckPromise = (async () => {
      try {
        const { data } = await supabase.rpc('is_admin');
        adminCache.isAdmin = !!data;
        adminCache.timestamp = now;
        return !!data;
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Return cached value if available, even if expired
        return adminCache.isAdmin ?? false;
      } finally {
        adminCheckPromise = null;
      }
    })();

    return adminCheckPromise;
  };

  const checkIsSuperAdmin = async (): Promise<boolean> => {
    // If already checking, return the same promise to deduplicate concurrent calls
    if (superAdminCheckPromise) return superAdminCheckPromise;

    const now = Date.now();
    if (adminCache.isSuperAdmin !== null && (now - adminCache.timestamp) < ADMIN_CACHE_TTL) {
      return adminCache.isSuperAdmin;
    }

    // Start new check and store promise for deduplication
    superAdminCheckPromise = (async () => {
      try {
        const { data } = await supabase.rpc('is_super_admin');
        adminCache.isSuperAdmin = !!data;
        adminCache.timestamp = now;
        return !!data;
      } catch (error) {
        console.error('Error checking super admin status:', error);
        // Return cached value if available, even if expired
        return adminCache.isSuperAdmin ?? false;
      } finally {
        superAdminCheckPromise = null;
      }
    })();

    return superAdminCheckPromise;
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