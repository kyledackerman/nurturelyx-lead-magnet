import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Phase 2.3: CRM metrics with 30-second caching

interface CRMMetrics {
  totalProspects: number;
  pipelineValue: number;
  hotLeads: number;
  overdueTasks: number;
  dueTodayTasks: number;
  statusBreakdown: Record<string, number>;
}

export function useCRMMetrics() {
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef<{ data: CRMMetrics | null; timestamp: number }>({ 
    data: null, 
    timestamp: 0 
  });
  const CACHE_DURATION = 30000; // 30 seconds

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    // Check cache first
    const now = Date.now();
    if (cacheRef.current.data && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setMetrics(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_crm_metrics');
      
      if (error) throw error;
      
      if (data && typeof data === 'object') {
        const metricsData = data as unknown as CRMMetrics;
        setMetrics(metricsData);
        cacheRef.current = { data: metricsData, timestamp: now };
      }
    } catch (error) {
      console.error("Error fetching CRM metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refetch: fetchMetrics };
}
