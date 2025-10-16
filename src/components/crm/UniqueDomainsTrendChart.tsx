import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { CRMChartSkeleton } from "./CRMLoadingSkeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendData {
  date: string;
  count: number;
}

interface ComparisonStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
}

export function UniqueDomainsTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [stats, setStats] = useState<ComparisonStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString();

      // Query prospect_activities with contacts that have emails (enriched)
      const { data: enrichedData, error } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          updated_at,
          report_id,
          reports!inner(domain)
        `)
        .gte("updated_at", startDate)
        .order("updated_at", { ascending: true });

      if (error) throw error;

      // Filter to only include prospects with email contacts
      const { data: contactsData } = await supabase
        .from("prospect_contacts")
        .select("prospect_activity_id, email")
        .not('email', 'is', null)
        .neq('email', '');

      const enrichedProspectIds = new Set(
        contactsData?.map(c => c.prospect_activity_id) || []
      );

      // Group by date and count unique domains that are enriched
      const dailyDomainsMap = new Map<string, Set<string>>();
      
      enrichedData?.forEach((item: any) => {
        if (enrichedProspectIds.has(item.id)) {
          const dateKey = item.updated_at.slice(0, 10);
          if (!dailyDomainsMap.has(dateKey)) {
            dailyDomainsMap.set(dateKey, new Set());
          }
          dailyDomainsMap.get(dateKey)!.add(item.reports.domain);
        }
      });

      // Build chart data for last 30 days
      const chartData: TrendData[] = [];
      for (let i = 29; i >= 0; i--) {
        const dateObj = new Date();
        dateObj.setUTCDate(dateObj.getUTCDate() - i);
        const dateKey = dateObj.toISOString().slice(0, 10);
        const uniqueDomains = dailyDomainsMap.get(dateKey)?.size || 0;
        
        chartData.push({
          date: format(dateObj, "MMM dd"),
          count: uniqueDomains,
        });
      }

      setData(chartData);
      await fetchComparisonStats();
    } catch (error) {
      console.error("Error fetching unique domains trend:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
      const yesterdayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)).toISOString();
      const yesterdayEnd = todayStart;
      
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const thisWeekStart = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate())).toISOString();
      
      const lastWeekStart = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() - 7)).toISOString();
      const lastWeekEnd = thisWeekStart;
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1)).toISOString();
      
      const lastMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1)).toISOString();
      const lastMonthEnd = thisMonthStart;

      const countUniqueDomains = async (start: string, end?: string) => {
        let query = supabase
          .from("prospect_activities")
          .select(`
            id,
            updated_at,
            reports!inner(domain)
          `)
          .gte("updated_at", start);
        
        if (end) {
          query = query.lt("updated_at", end);
        }

        const { data } = await query;
        
        // Get enriched prospect IDs
        const { data: contactsData } = await supabase
          .from("prospect_contacts")
          .select("prospect_activity_id")
          .not('email', 'is', null)
          .neq('email', '');

        const enrichedIds = new Set(contactsData?.map(c => c.prospect_activity_id) || []);
        
        // Count unique domains that are enriched
        const uniqueDomains = new Set(
          data?.filter((item: any) => enrichedIds.has(item.id)).map((item: any) => item.reports.domain) || []
        );
        
        return uniqueDomains.size;
      };

      const [today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
        countUniqueDomains(todayStart),
        countUniqueDomains(yesterdayStart, yesterdayEnd),
        countUniqueDomains(thisWeekStart),
        countUniqueDomains(lastWeekStart, lastWeekEnd),
        countUniqueDomains(thisMonthStart),
        countUniqueDomains(lastMonthStart, lastMonthEnd),
      ]);

      setStats({ today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth });
    } catch (error) {
      console.error("Error fetching comparison stats:", error);
    }
  };

  const renderComparisonCard = (
    label: string,
    current: number,
    previous: number
  ) => {
    const change = current - previous;
    const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : '0.0';
    
    return (
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-2xl font-bold mb-1">{current}</div>
        <div className="flex items-center justify-center gap-1 text-xs">
          {change > 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{percentChange}%</span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">{percentChange}%</span>
            </>
          ) : (
            <>
              <Minus className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">0%</span>
            </>
          )}
          <span className="text-muted-foreground">vs {previous}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <CRMChartSkeleton />;
  }

  const hasData = data.some(d => d.count > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unique Domains Enriched</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No enrichment data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unique Domains Enriched</CardTitle>
      </CardHeader>
      <CardContent>
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {renderComparisonCard("Today", stats.today, stats.yesterday)}
            {renderComparisonCard("This Week", stats.thisWeek, stats.lastWeek)}
            {renderComparisonCard("This Month", stats.thisMonth, stats.lastMonth)}
          </div>
        )}
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
