import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { scrollToTopIfHomeLink } from "@/lib/scroll";

interface IndustryReportGridProps {
  industry: string;
}

export const IndustryReportGrid = ({ industry }: IndustryReportGridProps) => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['industry-reports', industry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, domain, slug, seo_title, extracted_company_name, report_data')
        .eq('industry', industry)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(9);
      
      if (error) throw error;
      return data;
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
        <Button asChild className="mt-4" onClick={scrollToTopIfHomeLink}>
          <Link to="/">Generate Your First Report</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => {
        const reportData = report.report_data as any;
        const missedLeads = reportData?.totalMissedLeads || 0;
        const revenueLost = reportData?.yearlyRevenueLost || 0;
        const companyName = report.extracted_company_name || report.domain;

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
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{missedLeads.toLocaleString()}</span>
                  <span className="text-muted-foreground">missed leads/year</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="font-medium">${revenueLost.toLocaleString()}</span>
                  <span className="text-muted-foreground">lost revenue/year</span>
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
  );
};
