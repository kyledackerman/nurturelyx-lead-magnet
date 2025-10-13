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

// Per-user admin cache to prevent cross-user cache poisoning
const adminCacheByUser: Record<string, {
  isAdmin: boolean | null;
  isSuperAdmin: boolean | null;
  timestamp: number;
}> = {};

// Track in-flight admin check promises per user to deduplicate concurrent calls
const adminPromiseByUser: Record<string, Promise<boolean> | null> = {};
const superAdminPromiseByUser: Record<string, Promise<boolean> | null> = {};

const ADMIN_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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
    // No user = no admin access
    if (!user?.id) return false;

    const userId = user.id;
    
    // If already checking for this user, return the same promise
    if (adminPromiseByUser[userId]) return adminPromiseByUser[userId]!;

    const now = Date.now();
    const cached = adminCacheByUser[userId];
    if (cached?.isAdmin !== null && (now - cached.timestamp) < ADMIN_CACHE_TTL) {
      return cached.isAdmin;
    }

    // Start new check and store promise for deduplication
    adminPromiseByUser[userId] = (async () => {
      try {
        // First check if regular admin
        const { data: isAdminData } = await supabase.rpc('is_admin');
        let result = !!isAdminData;
        
        // If not admin, check if super admin (super admins are also admins)
        if (!result) {
          const { data: isSuperAdminData } = await supabase.rpc('is_super_admin');
          result = !!isSuperAdminData;
        }
        
        // Update cache for this user
        adminCacheByUser[userId] = {
          isAdmin: result,
          isSuperAdmin: adminCacheByUser[userId]?.isSuperAdmin ?? null,
          timestamp: now
        };
        
        return result;
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Return cached value if available, even if expired
        return cached?.isAdmin ?? false;
      } finally {
        adminPromiseByUser[userId] = null;
      }
    })();

    return adminPromiseByUser[userId]!;
  };

  const checkIsSuperAdmin = async (): Promise<boolean> => {
    // No user = no super admin access
    if (!user?.id) return false;

    const userId = user.id;
    
    // If already checking for this user, return the same promise
    if (superAdminPromiseByUser[userId]) return superAdminPromiseByUser[userId]!;

    const now = Date.now();
    const cached = adminCacheByUser[userId];
    if (cached?.isSuperAdmin !== null && (now - cached.timestamp) < ADMIN_CACHE_TTL) {
      return cached.isSuperAdmin;
    }

    // Start new check and store promise for deduplication
    superAdminPromiseByUser[userId] = (async () => {
      try {
        const { data } = await supabase.rpc('is_super_admin');
        const result = !!data;
        
        // Update cache for this user
        adminCacheByUser[userId] = {
          isAdmin: adminCacheByUser[userId]?.isAdmin ?? null,
          isSuperAdmin: result,
          timestamp: now
        };
        
        return result;
      } catch (error) {
        console.error('Error checking super admin status:', error);
        // Return cached value if available, even if expired
        return cached?.isSuperAdmin ?? false;
      } finally {
        superAdminPromiseByUser[userId] = null;
      }
    })();

    return superAdminPromiseByUser[userId]!;
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