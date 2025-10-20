import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, Target, DollarSign } from "lucide-react";

interface Statistic {
  value: string;
  label: string;
  context: string;
  source?: string;
}

interface IndustryStatisticsProps {
  industryName: string;
  statistics: Statistic[];
  marketSize?: string;
  growthRate?: string;
}

export const IndustryStatistics = ({ 
  industryName, 
  statistics,
  marketSize,
  growthRate 
}: IndustryStatisticsProps) => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">Industry Data</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {industryName} Industry Statistics
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Understanding the market landscape and opportunity for visitor identification
          </p>
        </div>

        {(marketSize || growthRate) && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {marketSize && (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground mb-1">{marketSize}</div>
                      <div className="text-sm text-muted-foreground">Total Addressable Market</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {growthRate && (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground mb-1">{growthRate}</div>
                      <div className="text-sm text-muted-foreground">Annual Growth Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {statistics.map((stat, index) => (
            <Card key={index} className="border hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-destructive/10 rounded-lg flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-sm font-semibold mb-2">{stat.label}</div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.context}</p>
                    {stat.source && (
                      <div className="text-xs text-muted-foreground italic">
                        Source: {stat.source}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">The Hidden Opportunity</h3>
                <p className="text-muted-foreground">
                  Most {industryName.toLowerCase()} companies invest heavily in driving website traffic through SEO, PPC, and content marketing. 
                  However, without visitor identification, 70-95% of that traffic remains anonymous. This represents a massive untapped 
                  opportunity—these are warm leads who've already shown interest in your services but left without converting. 
                  Visitor identification recovers this lost potential by revealing who these visitors are, enabling targeted follow-up 
                  and dramatically improving your marketing ROI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
