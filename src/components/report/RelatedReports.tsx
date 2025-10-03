import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useRelatedReports } from "@/hooks/useRelatedReports";
import { scrollToTopIfHomeLink } from "@/lib/scroll";

interface RelatedReportsProps {
  currentReportId: string;
  industry: string | null;
  trafficVolume: number;
  revenueLost: number;
}

export const RelatedReports = ({
  currentReportId,
  industry,
  trafficVolume,
  revenueLost
}: RelatedReportsProps) => {
  const { data: relatedReports, isLoading } = useRelatedReports({
    currentReportId,
    industry,
    trafficVolume,
    revenueLost
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Loading related reports...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (!relatedReports || relatedReports.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Similar Companies Losing Revenue
          </h2>
          <p className="text-lg text-muted-foreground">
            See how other businesses in your industry are affected
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedReports.map((report: any) => {
            const reportData = report.report_data as any;
            const missedLeads = reportData?.totalMissedLeads || 0;
            const revenue = reportData?.yearlyRevenueLost || 0;
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
                      {report.industry && (
                        <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {report.industry}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{missedLeads.toLocaleString()}</span>
                      <span className="text-muted-foreground">missed leads</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span className="font-medium">${revenue.toLocaleString()}</span>
                      <span className="text-muted-foreground">lost revenue</span>
                    </div>
                  </div>

                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/report/${report.slug}`}>
                      View Report
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="gradient-bg" onClick={scrollToTopIfHomeLink}>
            <Link to="/">
              Calculate Your Own Lost Revenue
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
