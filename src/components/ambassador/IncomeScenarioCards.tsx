import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Star, Trophy } from "lucide-react";

interface Scenario {
  title: string;
  subtitle: string;
  referrals: number;
  tier: string;
  tierBadge: string;
  platformFeeRate: number;
  perLeadRate: number;
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
    referrals: 10,
    tier: "Bronze",
    tierBadge: "🥉",
    platformFeeRate: 30,
    perLeadRate: 0.05,
    leadsPerClient: 500,
    monthlyTotal: 550,
    annualTotal: 6600,
    icon: TrendingUp,
  },
  {
    title: "Building Momentum",
    subtitle: "Side income from existing connections",
    referrals: 50,
    tier: "Bronze",
    tierBadge: "🥉",
    platformFeeRate: 30,
    perLeadRate: 0.05,
    leadsPerClient: 1000,
    monthlyTotal: 4000,
    annualTotal: 48000,
    icon: Target,
    nextMilestone: "50 more referrals unlocks Silver 🚀",
  },
  {
    title: "Silver Tier Achiever",
    subtitle: "Serious focus on recurring income",
    referrals: 150,
    tier: "Silver",
    tierBadge: "🥈",
    platformFeeRate: 40,
    perLeadRate: 0.10,
    leadsPerClient: 1500,
    monthlyTotal: 28500,
    annualTotal: 342000,
    icon: Star,
    nextMilestone: "Silver unlocked at 100 referrals!",
  },
  {
    title: "Gold Tier - The Summit",
    subtitle: "The ultimate goal—will you be first?",
    referrals: 1000,
    tier: "Gold",
    tierBadge: "🏆",
    platformFeeRate: 50,
    perLeadRate: 0.15,
    leadsPerClient: 2000,
    monthlyTotal: 350000,
    annualTotal: 4200000,
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
          const platformFeeIncome = scenario.referrals * scenario.platformFeeRate;
          const perLeadIncome = scenario.referrals * scenario.leadsPerClient * scenario.perLeadRate;

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
                    {scenario.referrals} referrals
                  </Badge>
                </div>
                <CardTitle className="text-xl">{scenario.title}</CardTitle>
                <CardDescription>{scenario.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fees:</span>
                    <span className="font-mono">
                      {scenario.referrals} × ${scenario.platformFeeRate} = ${platformFeeIncome.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per-lead ({scenario.leadsPerClient.toLocaleString()}/client):</span>
                    <span className="font-mono">${perLeadIncome.toLocaleString()}/mo</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between items-center font-bold text-base">
                    <span>Monthly Total:</span>
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
