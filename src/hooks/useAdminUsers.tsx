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

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-admins');
      
      if (!error && data?.admins) {
        adminUsersCache.users = data.admins;
        adminUsersCache.timestamp = Date.now();
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  return { admins, loading, refetch: fetchAdmins };
}
