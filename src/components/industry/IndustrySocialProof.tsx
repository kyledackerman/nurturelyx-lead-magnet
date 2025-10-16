import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, DollarSign } from "lucide-react";

interface IndustrySocialProofProps {
  industry: string;
  industryName: string;
}

export const IndustrySocialProof = ({ industry, industryName }: IndustrySocialProofProps) => {
  const { data: stats } = useQuery({
    queryKey: ['industry-stats', industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('report_data, created_at')
        .eq('industry', industry);
      
      if (error) throw error;
      
      const totalReports = data.length;
      const totalIdentified = data.reduce((sum, report) => {
        const missedLeads = (report.report_data as any)?.missedLeads || 0;
        return sum + Math.round(missedLeads * 0.35); // 35% identification rate
      }, 0);
      
      const totalRevenue = data.reduce((sum, report) => {
        return sum + ((report.report_data as any)?.yearlyRevenueLost || 0);
      }, 0);
      
      const recentCount = data.filter(report => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(report.created_at) >= weekAgo;
      }).length;
      
      return {
        totalReports,
        totalIdentified,
        totalRevenue,
        recentCount
      };
    }
  });

  if (!stats || stats.totalReports === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-accent/5 to-background border-y border-accent/20">
      <div className="container max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-accent">
              Real {industryName} Companies • Real Visitor Data
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-background rounded-lg border border-accent/20">
            <div className="flex items-center justify-center gap-2 text-accent mb-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Companies</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalReports}</div>
            <div className="text-sm text-muted-foreground">
              {industryName} businesses identified their visitors
            </div>
            {stats.recentCount > 0 && (
              <div className="text-xs text-accent mt-2">
                +{stats.recentCount} this week
              </div>
            )}
          </div>
          
          <div className="text-center p-6 bg-background rounded-lg border border-accent/20">
            <div className="flex items-center justify-center gap-2 text-accent mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Visitors Identified</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats.totalIdentified.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              From anonymous traffic
            </div>
          </div>
          
          <div className="text-center p-6 bg-background rounded-lg border border-accent/20">
            <div className="flex items-center justify-center gap-2 text-accent mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Revenue Opportunity</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${(stats.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground">
              Unlocked by identity resolution
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
