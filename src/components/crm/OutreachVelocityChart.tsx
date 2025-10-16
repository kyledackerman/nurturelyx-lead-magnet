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

export function OutreachVelocityChart() {
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

      // Query audit logs for status changes to contacted/interested/proposal/closed_won
      const { data: auditData, error } = await supabase
        .from("audit_logs")
        .select(`
          changed_at,
          record_id,
          new_value
        `)
        .eq("table_name", "prospect_activities")
        .eq("field_name", "status")
        .in("new_value", ["contacted", "interested", "proposal", "closed_won"])
        .gte("changed_at", startDate)
        .order("changed_at", { ascending: true });

      if (error) throw error;

      // Get prospect activities to map to domains
      const prospectIds = auditData?.map(a => a.record_id) || [];
      const { data: prospectsData } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          report_id,
          reports!inner(domain)
        `)
        .in("id", prospectIds);

      const prospectDomainMap = new Map(
        prospectsData?.map((p: any) => [p.id, p.reports.domain]) || []
      );

      // Group by date and count unique domains contacted
      const dailyDomainsMap = new Map<string, Set<string>>();
      
      auditData?.forEach((item) => {
        const dateKey = item.changed_at.slice(0, 10);
        const domain = prospectDomainMap.get(item.record_id);
        
        if (domain) {
          if (!dailyDomainsMap.has(dateKey)) {
            dailyDomainsMap.set(dateKey, new Set());
          }
          dailyDomainsMap.get(dateKey)!.add(domain);
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
      console.error("Error fetching outreach velocity:", error);
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

      const countContactedDomains = async (start: string, end?: string) => {
        let query = supabase
          .from("audit_logs")
          .select(`
            record_id,
            new_value
          `)
          .eq("table_name", "prospect_activities")
          .eq("field_name", "status")
          .in("new_value", ["contacted", "interested", "proposal", "closed_won"])
          .gte("changed_at", start);
        
        if (end) {
          query = query.lt("changed_at", end);
        }

        const { data: auditData } = await query;
        
        const prospectIds = auditData?.map(a => a.record_id) || [];
        const { data: prospectsData } = await supabase
          .from("prospect_activities")
          .select(`
            id,
            reports!inner(domain)
          `)
          .in("id", prospectIds);

        const uniqueDomains = new Set(
          prospectsData?.map((p: any) => p.reports.domain) || []
        );
        
        return uniqueDomains.size;
      };

      const [today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
        countContactedDomains(todayStart),
        countContactedDomains(yesterdayStart, yesterdayEnd),
        countContactedDomains(thisWeekStart),
        countContactedDomains(lastWeekStart, lastWeekEnd),
        countContactedDomains(thisMonthStart),
        countContactedDomains(lastMonthStart, lastMonthEnd),
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
          <CardTitle>Outreach Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No outreach data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outreach Velocity</CardTitle>
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
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
