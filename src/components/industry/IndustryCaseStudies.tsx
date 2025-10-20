import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Clock } from "lucide-react";

interface CaseStudy {
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    icon: "revenue" | "leads" | "time" | "growth";
  }[];
  quote: string;
  timeframe: string;
}

interface IndustryCaseStudiesProps {
  caseStudies: CaseStudy[];
  industryName: string;
}

const iconMap = {
  revenue: DollarSign,
  leads: Users,
  time: Clock,
  growth: TrendingUp,
};

export const IndustryCaseStudies = ({ caseStudies, industryName }: IndustryCaseStudiesProps) => {
  return (
    <section className="py-16 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">Case Studies</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real Results From {industryName} Companies
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how visitor identification transformed lead generation for businesses just like yours
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{study.company}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{study.industry}</Badge>
                      <span>•</span>
                      <span>{study.timeframe}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="font-semibold text-destructive mb-2">The Challenge</h3>
                    <p className="text-muted-foreground">{study.challenge}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">The Solution</h3>
                    <p className="text-muted-foreground">{study.solution}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <h3 className="font-semibold mb-4 text-lg">Results Achieved</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {study.results.map((result, idx) => {
                      const Icon = iconMap[result.icon];
                      return (
                        <div key={idx} className="text-center p-4 bg-muted/50 rounded-lg">
                          <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="text-2xl font-bold text-foreground">{result.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{result.metric}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground bg-muted/30 p-4 rounded-r-lg">
                  "{study.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
