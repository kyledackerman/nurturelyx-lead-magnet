import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export function IncomeCalculator() {
  const [referrals, setReferrals] = useState(50);
  const [leadsPerClient, setLeadsPerClient] = useState(1000);

  // Determine tiers based on referral count
  let platformFeeTier = 'Bronze';
  let platformFeeRate = 30;
  let perLeadTier = 'Bronze';
  let perLeadRate = 0.05;

  if (referrals >= 1000) {
    platformFeeTier = 'Gold';
    platformFeeRate = 50;
    perLeadTier = 'Gold';
    perLeadRate = 0.15;
  } else if (referrals >= 100) {
    platformFeeTier = 'Silver';
    platformFeeRate = 40;
    perLeadTier = 'Silver';
    perLeadRate = 0.10;
  }

  // Calculate income
  const platformFeeIncome = referrals * platformFeeRate;
  const perLeadIncome = referrals * leadsPerClient * perLeadRate;
  const totalMonthly = platformFeeIncome + perLeadIncome;
  const totalYearly = totalMonthly * 12;

  // Calculate next tier
  let nextTierMessage = '';
  if (referrals < 100) {
    nextTierMessage = `${100 - referrals} more referrals unlock Silver tier → $40/mo per client + $0.10/lead`;
  } else if (referrals < 1000) {
    nextTierMessage = `${1000 - referrals} more referrals unlock Gold tier → $50/mo per client + $0.15/lead`;
  } else {
    nextTierMessage = 'You\'re at the highest tier! 🏆';
  }

  const referralOptions = [5, 10, 25, 50, 100, 150, 250, 500, 1000, 1500];
  const leadsOptions = [100, 500, 1000, 1500, 2000, 5000];

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl">Calculate Your Potential Income</CardTitle>
        <CardDescription>
          Adjust the sliders to see realistic income projections based on your network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referrals Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-semibold">How many businesses could you refer?</Label>
            <Badge variant="secondary" className="text-lg font-bold">{referrals}</Badge>
          </div>
          <Slider
            value={[referralOptions.indexOf(referrals) !== -1 ? referralOptions.indexOf(referrals) : 3]}
            max={referralOptions.length - 1}
            step={1}
            onValueChange={(value) => setReferrals(referralOptions[value[0]])}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5</span>
            <span>1,500</span>
          </div>
        </div>

        {/* Leads Per Client Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-semibold">Average leads per client per month?</Label>
            <Badge variant="secondary" className="text-lg font-bold">{leadsPerClient.toLocaleString()}</Badge>
          </div>
          <Slider
            value={[leadsOptions.indexOf(leadsPerClient) !== -1 ? leadsOptions.indexOf(leadsPerClient) : 2]}
            max={leadsOptions.length - 1}
            step={1}
            onValueChange={(value) => setLeadsPerClient(leadsOptions[value[0]])}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>5,000</span>
          </div>
        </div>

        {/* Results Display */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 border border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              If you refer <strong className="text-foreground">{referrals}</strong> businesses averaging{' '}
              <strong className="text-foreground">{leadsPerClient.toLocaleString()}</strong> leads/month...
            </p>
          </div>

          <div className="border-t border-b border-border py-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Your Tier:</span>
              <Badge variant="default" className="font-bold">
                {platformFeeTier} (0-{platformFeeTier === 'Bronze' ? '99' : platformFeeTier === 'Silver' ? '999' : '∞'} referrals)
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Recurring Income:</span>
              <span className="font-mono text-sm">
                {referrals} × ${platformFeeRate} = <strong className="text-foreground">${platformFeeIncome.toLocaleString()}/mo</strong>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Per-Lead Income:</span>
              <span className="font-mono text-sm">
                {referrals} × {leadsPerClient.toLocaleString()} × ${perLeadRate} = <strong className="text-foreground">${perLeadIncome.toLocaleString()}/mo</strong>
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between items-center text-lg md:text-xl font-bold">
              <span>TOTAL MONTHLY:</span>
              <span className="text-primary">${totalMonthly.toLocaleString()}/month</span>
            </div>
            <div className="flex justify-between items-center text-base text-muted-foreground mt-1">
              <span>ANNUAL PROJECTION:</span>
              <span className="text-foreground font-semibold">${totalYearly.toLocaleString()}/year</span>
            </div>
          </div>

          {referrals < 1000 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
              <p className="text-sm text-foreground flex items-start gap-2">
                <span className="text-lg">🚀</span>
                <span>{nextTierMessage}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
