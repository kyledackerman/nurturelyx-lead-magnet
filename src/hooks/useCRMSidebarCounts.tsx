import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCRMSidebarCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    const { data, error } = await supabase.rpc('get_crm_sidebar_counts');
    if (error) {
      console.error('Error fetching sidebar counts:', error);
      return;
    }
    setCounts((data as Record<string, number>) || {});
    setLoading(false);
  };

  useEffect(() => {
    fetchCounts();

    // Subscribe to changes
    const channel = supabase
      .channel('sidebar-counts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prospect_activities' }, fetchCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prospect_contacts' }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { counts, loading };
}
