import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { scrollToTop } from "@/lib/scroll";

interface IndustryReportGridProps {
  industry: string;
}

export const IndustryReportGrid = ({ industry }: IndustryReportGridProps) => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['industry-reports', industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, domain, slug, seo_title, extracted_company_name, report_data, created_at')
        .eq('industry', industry)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(9);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['industry-report-stats', industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('report_data')
        .eq('industry', industry);
      
      if (error) throw error;
      
      const totalIdentified = data.reduce((sum, report) => {
        const missedLeads = (report.report_data as any)?.missedLeads || 0;
        return sum + Math.round(missedLeads * 0.35);
      }, 0);
      
      const totalRevenue = data.reduce((sum, report) => {
        return sum + ((report.report_data as any)?.yearlyRevenueLost || 0);
      }, 0);
      
      return {
        count: data.length,
        totalIdentified,
        totalRevenue
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reports available yet for this industry.</p>
        <Button asChild className="mt-4">
          <Link to="/">Generate Your First Report</Link>
        </Button>
      </div>
    );
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <>
      {stats && stats.count > 0 && (
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            {stats.count} Companies Have Identified {stats.totalIdentified.toLocaleString()} Anonymous Visitors
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            These are real companies who discovered how many qualified leads 
            were visiting their website anonymously. Now they know exactly who to call.
          </p>
          
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="text-sm text-muted-foreground mb-1">Reports Generated</div>
              <div className="text-2xl font-bold">{stats.count}</div>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="text-sm text-muted-foreground mb-1">Visitors Identified</div>
              <div className="text-2xl font-bold">{stats.totalIdentified.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">From anonymous traffic</div>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="text-sm text-muted-foreground mb-1">Revenue Opportunity</div>
              <div className="text-2xl font-bold">${(stats.totalRevenue / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-muted-foreground">Unlocked</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => {
        const reportData = report.report_data as any;
        const missedLeads = reportData?.missedLeads || 0;
        const identifiedLeads = Math.round(missedLeads * 0.35);
        const revenueLost = reportData?.yearlyRevenueLost || 0;
        const companyName = report.extracted_company_name || report.domain;
        const isHighValue = revenueLost > 100000;

        return (
          <Card key={report.id} className="hover:shadow-lg transition-shadow group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {companyName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{report.domain}</p>
                </div>
                {isHighValue && (
                  <div className="px-2 py-1 bg-accent/20 text-accent text-xs font-semibold rounded">
                    High Value
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground mb-3">
                Generated {formatRelativeTime(report.created_at)}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="font-medium text-accent">{identifiedLeads.toLocaleString()}</span>
                  <span className="text-muted-foreground">leads identified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">${revenueLost.toLocaleString()}</span>
                  <span className="text-muted-foreground">annual opportunity</span>
                </div>
              </div>

              <Button asChild className="w-full" variant="outline">
                <Link to={`/report/${report.slug}`}>
                  View Full Report
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
    </>
  );
};
