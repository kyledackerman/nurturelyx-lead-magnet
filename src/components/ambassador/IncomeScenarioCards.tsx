import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Star, Trophy } from "lucide-react";

interface Scenario {
  title: string;
  subtitle: string;
  signups: number;
  tier: string;
  tierBadge: string;
  commissionRate: number;
  avgLeadPrice: number;
  leadsPerClient: number;
  monthlyTotal: number;
  annualTotal: number;
  icon: React.ElementType;
  nextMilestone?: string;
}

const scenarios: Scenario[] = [
  {
    title: "Getting Started",
    subtitle: "Testing the waters with your network",
    signups: 10,
    tier: "Bronze",
    tierBadge: "🥉",
    commissionRate: 0.05,
    avgLeadPrice: 0.50,
    leadsPerClient: 500,
    monthlyTotal: 125, // 10 × 500 × 0.50 × 0.05
    annualTotal: 1500,
    icon: TrendingUp,
  },
  {
    title: "Building Momentum",
    subtitle: "Side income from existing connections",
    signups: 50,
    tier: "Bronze",
    tierBadge: "🥉",
    commissionRate: 0.05,
    avgLeadPrice: 0.75,
    leadsPerClient: 1000,
    monthlyTotal: 1875, // 50 × 1000 × 0.75 × 0.05
    annualTotal: 22500,
    icon: Target,
    nextMilestone: "50 more signups unlocks Silver (10%) 🚀",
  },
  {
    title: "Silver Tier Achiever",
    subtitle: "Serious focus on recurring income",
    signups: 150,
    tier: "Silver",
    tierBadge: "🥈",
    commissionRate: 0.10,
    avgLeadPrice: 1.00,
    leadsPerClient: 1500,
    monthlyTotal: 22500, // 150 × 1500 × 1.00 × 0.10
    annualTotal: 270000,
    icon: Star,
    nextMilestone: "Silver unlocked at 100 signups!",
  },
  {
    title: "Gold Tier - The Summit",
    subtitle: "The ultimate goal—will you be first?",
    signups: 1000,
    tier: "Gold",
    tierBadge: "🏆",
    commissionRate: 0.15,
    avgLeadPrice: 1.00,
    leadsPerClient: 2000,
    monthlyTotal: 300000, // 1000 × 2000 × 1.00 × 0.15
    annualTotal: 3600000,
    icon: Trophy,
    nextMilestone: "No one has reached this yet—Elite Status",
  },
];

export function IncomeScenarioCards() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-3">Four Realistic Income Scenarios</h2>
        <p className="text-muted-foreground">
          See how different referral volumes translate to actual income. These are projections, not guarantees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const totalLeads = scenario.signups * scenario.leadsPerClient;
          const totalRevenue = totalLeads * scenario.avgLeadPrice;

          return (
            <Card
              key={scenario.title}
              className="border-2 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <Badge variant="outline" className="font-bold">
                      {scenario.tier} {scenario.tierBadge}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {scenario.signups} signups
                  </Badge>
                </div>
                <CardTitle className="text-xl">{scenario.title}</CardTitle>
                <CardDescription>{scenario.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clients × Leads/Mo:</span>
                    <span className="font-mono">
                      {scenario.signups} × {scenario.leadsPerClient.toLocaleString()} = {totalLeads.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lead price:</span>
                    <span className="font-mono">${scenario.avgLeadPrice.toFixed(2)}/lead</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client revenue:</span>
                    <span className="font-mono">${totalRevenue.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your rate:</span>
                    <span className="font-mono">{(scenario.commissionRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between items-center font-bold text-base">
                    <span>Your Commission:</span>
                    <span className="text-primary">${scenario.monthlyTotal.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Annual:</span>
                    <span className="text-foreground font-semibold">${scenario.annualTotal.toLocaleString()}/yr</span>
                  </div>
                </div>

                {scenario.nextMilestone && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-xs text-center">
                    {scenario.nextMilestone}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
