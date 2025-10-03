import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign } from "lucide-react";

interface CaseStudy {
  company: string;
  industry: string;
  result: string;
  metrics: {
    leadsIncrease: string;
    revenueIncrease: string;
    timeframe: string;
  };
}

const caseStudies: CaseStudy[] = [
  {
    company: "Premier HVAC Services",
    industry: "Home Services",
    result: "Increased lead capture by 285% in first 60 days",
    metrics: {
      leadsIncrease: "285%",
      revenueIncrease: "$127K",
      timeframe: "60 days"
    }
  },
  {
    company: "Thompson Legal Group",
    industry: "Legal Services",
    result: "Converted anonymous traffic into $450K annual revenue",
    metrics: {
      leadsIncrease: "340%",
      revenueIncrease: "$450K",
      timeframe: "12 months"
    }
  },
  {
    company: "Elite Property Solutions",
    industry: "Real Estate",
    result: "Identified 2,400 high-value prospects in 90 days",
    metrics: {
      leadsIncrease: "420%",
      revenueIncrease: "$890K",
      timeframe: "90 days"
    }
  }
];

const CaseStudyCard = () => {
  return (
    <div className="mt-8 space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-foreground mb-2">Real Results from Real Businesses</h3>
        <p className="text-muted-foreground">See how companies like yours stopped losing revenue</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caseStudies.map((study, index) => (
          <Card key={index} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {study.industry}
                </div>
                <div className="text-lg font-bold text-foreground mt-1">
                  {study.company}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground italic">
                "{study.result}"
              </p>
              
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-primary/20">
                <div className="text-center">
                  <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{study.metrics.leadsIncrease}</div>
                  <div className="text-xs text-muted-foreground">Leads</div>
                </div>
                <div className="text-center">
                  <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{study.metrics.revenueIncrease}</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
                <div className="text-center">
                  <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{study.metrics.timeframe}</div>
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CaseStudyCard;
