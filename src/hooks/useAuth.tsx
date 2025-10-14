import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetSession: () => Promise<void>;
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

// Helper to invalidate cache for a specific user
export const invalidateAdminCache = (userId?: string) => {
  if (userId) {
    delete adminCacheByUser[userId];
    adminPromiseByUser[userId] = null;
    superAdminPromiseByUser[userId] = null;
  }
};

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

    // THEN check for existing session with retry logic
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session init error:', error);
          
          // If we get a network/fetch error, try once more after delay
          if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
            console.warn('Supabase fetch failed, retrying in 500ms...');
            setTimeout(async () => {
              try {
                const { data: { session: retrySession } } = await supabase.auth.getSession();
                setSession(retrySession);
                setUser(retrySession?.user ?? null);
              } catch (retryError) {
                console.error('Retry failed, continuing without session:', retryError);
              } finally {
                setLoading(false);
              }
            }, 500);
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected session init error:', err);
        setLoading(false);
      }
    };

    initSession();

    return () => subscription.unsubscribe();
  }, []);


  const checkIsAdmin = useCallback(async (): Promise<boolean> => {
    // No user or no session = no admin access
    if (!user?.id || !session?.access_token) return false;

    const userId = user.id;
    
    // If already checking for this user, return the same promise
    if (adminPromiseByUser[userId]) return adminPromiseByUser[userId]!;

    const now = Date.now();
    const cached = adminCacheByUser[userId];
    
    // Safe cache check with proper guards
    if (cached && cached.isAdmin !== null && (now - cached.timestamp) < ADMIN_CACHE_TTL) {
      console.debug('Using cached admin status:', cached.isAdmin);
      return cached.isAdmin;
    }

    // Start new check and store promise for deduplication
    adminPromiseByUser[userId] = (async () => {
      try {
        // Call the new is-admin edge function with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(
          'https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/is-admin',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Admin check failed: ${response.status}`);
        }

        const { isAdmin } = await response.json();
        const result = !!isAdmin;
        
        console.debug('Admin check result:', result);
        
        // Update cache for this user
        adminCacheByUser[userId] = {
          isAdmin: result,
          isSuperAdmin: adminCacheByUser[userId]?.isSuperAdmin ?? null,
          timestamp: Date.now()
        };
        
        return result;
      } catch (error) {
        console.error('Admin check failed; preserving cache if available:', error);
        // On error, return cached value if available (don't demote to false)
        if (cached && cached.isAdmin !== null) {
          return cached.isAdmin;
        }
        return false;
      } finally {
        adminPromiseByUser[userId] = null;
      }
    })();

    return adminPromiseByUser[userId]!;
  }, [user?.id, session?.access_token]);

  const checkIsSuperAdmin = useCallback(async (): Promise<boolean> => {
    // No user = no super admin access
    if (!user?.id) return false;

    const userId = user.id;
    
    // If already checking for this user, return the same promise
    if (superAdminPromiseByUser[userId]) return superAdminPromiseByUser[userId]!;

    const now = Date.now();
    const cached = adminCacheByUser[userId];
    
    // Safe cache check with proper guards
    if (cached && cached.isSuperAdmin !== null && (now - cached.timestamp) < ADMIN_CACHE_TTL) {
      console.debug('Using cached super admin status:', cached.isSuperAdmin);
      return cached.isSuperAdmin;
    }

    // Start new check and store promise for deduplication
    superAdminPromiseByUser[userId] = (async () => {
      try {
        const { data, error } = await supabase.rpc('is_super_admin');
        
        if (error) throw error;
        
        const result = !!data;
        console.debug('Super admin check result:', result);
        
        // Update cache for this user
        adminCacheByUser[userId] = {
          isAdmin: adminCacheByUser[userId]?.isAdmin ?? null,
          isSuperAdmin: result,
          timestamp: Date.now()
        };
        
        return result;
      } catch (error) {
        console.error('Super admin check failed; preserving cache if available:', error);
        // On error, return cached value if available (don't demote to false)
        if (cached && cached.isSuperAdmin !== null) {
          return cached.isSuperAdmin;
        }
        return false;
      } finally {
        superAdminPromiseByUser[userId] = null;
      }
    })();

    return superAdminPromiseByUser[userId]!;
  }, [user?.id]);

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetSession = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Clear local storage auth token
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
      // Reload page to reinitialize
      window.location.reload();
    } catch (error) {
      console.error('Reset session error:', error);
      // Force reload anyway
      window.location.reload();
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  }, []);

  const requestPasswordReset = useCallback(async (userId: string, reason?: string) => {
    const { error } = await supabase
      .from('password_reset_requests')
      .insert({
        user_id: userId,
        requested_by: user?.id || '',
        reason: reason || null,
      });
    return { error };
  }, [user?.id]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetSession,
    updatePassword,
    requestPasswordReset,
    checkIsAdmin,
    checkIsSuperAdmin,
  }), [user, session, loading, signUp, signIn, signOut, resetSession, updatePassword, requestPasswordReset, checkIsAdmin, checkIsSuperAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};