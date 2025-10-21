import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Trophy, GraduationCap, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: DollarSign,
    title: "Dual Income Streams",
    description: "Earn platform fees ($30-$50/mo per client) PLUS per-lead commissions ($0.05-$0.15/lead). Both compound as you scale.",
  },
  {
    icon: TrendingUp,
    title: "Automatic Tier Upgrades",
    description: "Bronze (0-99 referrals) → Silver (100-999) → Gold (1000+). Your commission rates automatically increase as you grow.",
  },
  {
    icon: Trophy,
    title: "Competitive Rankings",
    description: "Track your performance vs. other ambassadors. Earn badges. See who's dominating.",
    link: "/ambassador/leaderboard",
    linkText: "View Leaderboard →",
  },
  {
    icon: GraduationCap,
    title: "Everything You Need to Succeed",
    description: "Onboarding call, pre-written scripts, demo videos, Slack community. We set you up for success.",
  },
  {
    icon: Zap,
    title: "Build at Your Own Pace",
    description: "Refer 5 businesses or 500—your choice. No monthly minimums. No forced targets.",
  },
  {
    icon: CheckCircle,
    title: "Flexible Earnings Options",
    description: "Earn commissions as credits. Use them to buy leads or cash out monthly ($100 minimum).",
  },
];

export function BenefitsGrid() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-3">Why Join the Ambassador Program?</h2>
        <p className="text-muted-foreground">
          Six compelling reasons to become a NurturelyX Ambassador
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <Card key={benefit.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {benefit.description}
                </CardDescription>
                {benefit.link && (
                  <Link 
                    to={benefit.link} 
                    className="text-primary hover:underline text-sm font-medium mt-3 inline-block"
                  >
                    {benefit.linkText}
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
