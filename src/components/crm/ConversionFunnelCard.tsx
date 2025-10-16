import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CRMMetricsSkeleton } from "./CRMLoadingSkeleton";

interface FunnelMetrics {
  totalDomains: number;
  enrichedDomains: number;
  contactedDomains: number;
  wonDomains: number;
  enrichmentRate: number;
  contactRate: number;
  winRate: number;
  overallConversion: number;
}

export function ConversionFunnelCard() {
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Get total unique domains
      const { data: allProspects } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          status,
          reports!inner(domain)
        `);

      const totalDomains = new Set(
        allProspects?.map((p: any) => p.reports.domain) || []
      ).size;

      // Get enriched domains (prospects with email contacts)
      const { data: contactsData } = await supabase
        .from("prospect_contacts")
        .select("prospect_activity_id, email")
        .not('email', 'is', null)
        .neq('email', '');

      const enrichedProspectIds = new Set(
        contactsData?.map(c => c.prospect_activity_id) || []
      );

      const enrichedDomains = new Set(
        allProspects?.filter((p: any) => enrichedProspectIds.has(p.id))
          .map((p: any) => p.reports.domain) || []
      ).size;

      // Get contacted domains (status in contacted, interested, proposal, closed_won)
      const contactedDomains = new Set(
        allProspects?.filter((p: any) => 
          ['contacted', 'interested', 'proposal', 'closed_won'].includes(p.status)
        ).map((p: any) => p.reports.domain) || []
      ).size;

      // Get won domains
      const wonDomains = new Set(
        allProspects?.filter((p: any) => p.status === 'closed_won')
          .map((p: any) => p.reports.domain) || []
      ).size;

      // Calculate rates
      const enrichmentRate = totalDomains > 0 
        ? (enrichedDomains / totalDomains) * 100 
        : 0;
      
      const contactRate = enrichedDomains > 0 
        ? (contactedDomains / enrichedDomains) * 100 
        : 0;
      
      const winRate = contactedDomains > 0 
        ? (wonDomains / contactedDomains) * 100 
        : 0;
      
      const overallConversion = totalDomains > 0 
        ? (wonDomains / totalDomains) * 100 
        : 0;

      setMetrics({
        totalDomains,
        enrichedDomains,
        contactedDomains,
        wonDomains,
        enrichmentRate,
        contactRate,
        winRate,
        overallConversion,
      });
    } catch (error) {
      console.error("Error fetching conversion funnel metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRateColor = (rate: number, thresholds: { good: number; medium: number }) => {
    if (rate >= thresholds.good) return "text-green-500";
    if (rate >= thresholds.medium) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return <CRMMetricsSkeleton />;
  }

  if (!metrics) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Stage 1: Total Domains */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total Domains</div>
            <div className="text-3xl font-bold">{metrics.totalDomains}</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '100%' }} />
            </div>
            <div className="text-xs text-muted-foreground">100%</div>
          </div>

          {/* Stage 2: Enriched */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Enriched</div>
            <div className="text-3xl font-bold">{metrics.enrichedDomains}</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${Math.min(metrics.enrichmentRate, 100)}%` }} 
              />
            </div>
            <div className={`text-xs font-medium ${getRateColor(metrics.enrichmentRate, { good: 50, medium: 30 })}`}>
              {metrics.enrichmentRate.toFixed(1)}% enrichment rate
            </div>
          </div>

          {/* Stage 3: Contacted */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Contacted</div>
            <div className="text-3xl font-bold">{metrics.contactedDomains}</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${Math.min(metrics.contactRate, 100)}%` }} 
              />
            </div>
            <div className={`text-xs font-medium ${getRateColor(metrics.contactRate, { good: 70, medium: 50 })}`}>
              {metrics.contactRate.toFixed(1)}% contact rate
            </div>
          </div>

          {/* Stage 4: Won */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Won</div>
            <div className="text-3xl font-bold">{metrics.wonDomains}</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500" 
                style={{ width: `${Math.min(metrics.winRate, 100)}%` }} 
              />
            </div>
            <div className={`text-xs font-medium ${getRateColor(metrics.winRate, { good: 5, medium: 2 })}`}>
              {metrics.winRate.toFixed(2)}% win rate
            </div>
          </div>
        </div>

        {/* Overall Conversion */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Conversion Rate</span>
            <span className={`text-2xl font-bold ${getRateColor(metrics.overallConversion, { good: 3, medium: 1 })}`}>
              {metrics.overallConversion.toFixed(2)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {metrics.wonDomains} won out of {metrics.totalDomains} total domains
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
