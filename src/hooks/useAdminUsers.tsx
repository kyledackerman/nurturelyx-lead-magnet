import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Phase 2.1: Shared admin users hook with caching

interface AdminUser {
  id: string;
  email: string;
}

// In-memory cache with 5-minute TTL
const adminUsersCache: { 
  users: AdminUser[] | null; 
  timestamp: number 
} = {
  users: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useAdminUsers() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = Date.now();
    
    // Return cached data if fresh
    if (adminUsersCache.users && (now - adminUsersCache.timestamp) < CACHE_TTL) {
      setAdmins(adminUsersCache.users);
      setLoading(false);
      return;
    }

    // Fetch fresh data
    fetchAdmins();
  }, []);

  const fetchAdmins = async (retryCount = 0) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-admins');
      
      if (!error && data?.admins) {
        adminUsersCache.users = data.admins;
        adminUsersCache.timestamp = Date.now();
        setAdmins(data.admins);
        setLoading(false);
        return;
      }
      
      // If error and we have retries left, try again with exponential backoff
      if (error && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.warn(`Admin fetch failed, retrying in ${delay}ms (attempt ${retryCount + 1}/3)`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAdmins(retryCount + 1);
      }
      
      // All retries failed - use cached data if available
      if (adminUsersCache.users && adminUsersCache.users.length > 0) {
        console.warn('Using cached admin users after failed fetches');
        setAdmins(adminUsersCache.users);
      } else {
        console.error('Failed to fetch admins and no cache available');
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      
      // Use cached data as fallback
      if (adminUsersCache.users && adminUsersCache.users.length > 0) {
        console.warn('Using cached admin users after exception');
        setAdmins(adminUsersCache.users);
      }
    } finally {
      setLoading(false);
    }
  };

  return { admins, loading, refetch: fetchAdmins };
}
