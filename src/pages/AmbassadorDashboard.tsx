import { useQuery } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaderboardPreview } from "@/components/ambassador/LeaderboardPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Users, Target, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

export default function AmbassadorDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['ambassador-stats'],
    queryFn: () => ambassadorService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: false, // Disable retries - fail fast if edge function errors
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const performance = stats?.performance || {};
  const financials = stats?.financials || {};
  const tiers = stats?.tiers || {};

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ambassador Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {stats?.profile?.full_name}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/ambassador/marketplace')}>
            Browse Marketplace
          </Button>
          <Button onClick={() => navigate('/ambassador/submit')} variant="outline">
            Submit Domain
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Domains</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.active_domains || 0}</div>
            <p className="text-xs text-muted-foreground">Total domains managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.total_signups_lifetime || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financials.eligible_commission?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.conversion_rate?.toFixed(1) || '0.0'}%</div>
            <p className="text-xs text-muted-foreground">Domains to signups</p>
          </CardContent>
        </Card>

        <LeaderboardPreview />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Tier Progress</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate('/ambassador/marketplace')}
              >
                <div className="font-semibold mb-1">Browse Marketplace</div>
                <div className="text-xs text-muted-foreground text-left">Purchase leads for $0.05</div>
                <ArrowRight className="h-4 w-4 mt-2" />
              </Button>

              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate('/ambassador/submit')}
              >
                <div className="font-semibold mb-1">Submit New Domain</div>
                <div className="text-xs text-muted-foreground text-left">Get free assignment</div>
                <ArrowRight className="h-4 w-4 mt-2" />
              </Button>

              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate('/ambassador/domains')}
              >
                <div className="font-semibold mb-1">Manage My Domains</div>
                <div className="text-xs text-muted-foreground text-left">View and customize pricing</div>
                <ArrowRight className="h-4 w-4 mt-2" />
              </Button>

              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate('/ambassador/my-clients')}
              >
                <div className="font-semibold mb-1">My Clients</div>
                <div className="text-xs text-muted-foreground text-left">Track client onboarding</div>
                <ArrowRight className="h-4 w-4 mt-2" />
              </Button>

              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate('/ambassador/resources')}
              >
                <div className="font-semibold mb-1">📚 Sales Resources</div>
                <div className="text-xs text-muted-foreground text-left">Scripts, videos & battlecards</div>
                <ArrowRight className="h-4 w-4 mt-2" />
              </Button>

              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate('/ambassador/leaderboard')}
              >
                <div className="font-semibold mb-1">Leaderboard</div>
                <div className="text-xs text-muted-foreground text-left">See how you rank</div>
                <ArrowRight className="h-4 w-4 mt-2" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Domains Purchased</span>
                  <span className="font-semibold">{performance.total_domains_purchased || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Domains</span>
                  <span className="font-semibold">{performance.active_domains || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Leads Processed</span>
                  <span className="font-semibold">{performance.total_leads_processed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-semibold">{performance.conversion_rate?.toFixed(1) || '0.0'}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Commission</span>
                  <span className="font-semibold">${financials.pending_commission?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Eligible Commission</span>
                  <span className="font-semibold text-primary">${financials.eligible_commission?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lifetime Paid</span>
                  <span className="font-semibold">${financials.lifetime_paid?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next Payout Date</span>
                  <span className="font-semibold">
                    {financials.next_payout_date 
                      ? new Date(financials.next_payout_date).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Fee Tier: {tiers.platform_fee_tier?.toUpperCase()}</CardTitle>
              <CardDescription>
                Current commission rate: {tiers.platform_fee_rate}% of $100 monthly platform fee
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiers.next_tier_requirements?.platform_fee?.next && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {tiers.next_tier_requirements.platform_fee.next.toUpperCase()}</span>
                      <span>{tiers.next_tier_requirements.platform_fee.current} / {tiers.next_tier_requirements.platform_fee.current + tiers.next_tier_requirements.platform_fee.needed}</span>
                    </div>
                    <Progress 
                      value={(tiers.next_tier_requirements.platform_fee.current / (tiers.next_tier_requirements.platform_fee.current + tiers.next_tier_requirements.platform_fee.needed)) * 100} 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tiers.next_tier_requirements.platform_fee.needed} more signups needed to reach {tiers.next_tier_requirements.platform_fee.next.toUpperCase()} tier
                  </p>
                </>
              )}
              {!tiers.next_tier_requirements?.platform_fee?.next && (
                <p className="text-sm text-muted-foreground">🎉 You've reached the highest tier!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Per-Lead Tier: {tiers.per_lead_tier?.toUpperCase()}</CardTitle>
              <CardDescription>
                Current commission rate: {tiers.per_lead_rate}% of per-lead revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiers.next_tier_requirements?.per_lead?.next && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {tiers.next_tier_requirements.per_lead.next.toUpperCase()}</span>
                      <span>{tiers.next_tier_requirements.per_lead.current} / {tiers.next_tier_requirements.per_lead.current + tiers.next_tier_requirements.per_lead.needed}</span>
                    </div>
                    <Progress 
                      value={(tiers.next_tier_requirements.per_lead.current / (tiers.next_tier_requirements.per_lead.current + tiers.next_tier_requirements.per_lead.needed)) * 100} 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tiers.next_tier_requirements.per_lead.needed} more active domains needed to reach {tiers.next_tier_requirements.per_lead.next.toUpperCase()} tier
                  </p>
                </>
              )}
              {!tiers.next_tier_requirements?.per_lead?.next && (
                <p className="text-sm text-muted-foreground">🎉 You've reached the highest tier!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
              <CardDescription>Detailed view of your earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Pending (60-day hold)</div>
                  <div className="text-2xl font-bold">${financials.pending_commission?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-4 border rounded-lg bg-primary/5">
                  <div className="text-sm text-muted-foreground mb-1">Eligible (≥60 days)</div>
                  <div className="text-2xl font-bold text-primary">${financials.eligible_commission?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Lifetime Paid</div>
                  <div className="text-2xl font-bold">${financials.lifetime_paid?.toFixed(2) || '0.00'}</div>
                </div>
              </div>

              <Button className="w-full" onClick={() => navigate('/ambassador/commissions')}>
                View Full Commission History
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
