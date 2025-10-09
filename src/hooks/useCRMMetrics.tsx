import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Phase 3.1: Unified CRM metrics hook

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

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_crm_metrics');
      
      if (error) throw error;
      
      if (data && typeof data === 'object') {
        setMetrics(data as unknown as CRMMetrics);
      }
    } catch (error) {
      console.error("Error fetching CRM metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refetch: fetchMetrics };
}
