import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseRelatedReportsProps {
  currentReportId: string;
  industry: string | null;
  trafficVolume: number;
  revenueLost: number;
}

export const useRelatedReports = ({
  currentReportId,
  industry,
  trafficVolume,
  revenueLost
}: UseRelatedReportsProps) => {
  return useQuery({
    queryKey: ['related-reports', currentReportId, industry],
    queryFn: async () => {
      // First try to get reports from the same industry
      const { data, error } = await supabase
        .from('reports')
        .select('id, domain, slug, industry, seo_title, extracted_company_name, report_data')
        .eq('is_public', true)
        .neq('id', currentReportId)
        .limit(20);
      
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Filter and score reports by similarity
      const scoredReports = data
        .map(report => {
          let score = 0;
          const reportData = report.report_data as any;
          const reportTraffic = reportData?.organicTraffic || 0;
          const reportRevenue = reportData?.yearlyRevenueLost || 0;

          // Same industry gets highest priority (5 points)
          if (industry && report.industry === industry) {
            score += 5;
          }

          // Similar traffic volume (±50% = 3 points, ±100% = 1 point)
          const trafficDiff = Math.abs(reportTraffic - trafficVolume) / trafficVolume;
          if (trafficDiff <= 0.5) {
            score += 3;
          } else if (trafficDiff <= 1.0) {
            score += 1;
          }

          // Similar revenue loss (±30% = 3 points, ±60% = 1 point)
          const revenueDiff = Math.abs(reportRevenue - revenueLost) / revenueLost;
          if (revenueDiff <= 0.3) {
            score += 3;
          } else if (revenueDiff <= 0.6) {
            score += 1;
          }

          return { ...report, score };
        })
        .filter(report => report.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return scoredReports;
    },
    enabled: !!currentReportId
  });
};
