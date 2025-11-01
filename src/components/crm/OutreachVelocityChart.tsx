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
      const { data: chartData, error } = await supabase.rpc('get_daily_unique_domains_contacted', { days: 30 });

      if (error) throw error;

      // Format the data for the chart
      const formattedData = Array.isArray(chartData) ? chartData.map((item: any) => ({
        date: format(new Date(item.date), "MMM dd"),
        count: item.count
      })) : [];

      setData(formattedData);
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
      
      // Rolling 24-hour windows
      const last24hStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const prev24hStart = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const prev24hEnd = last24hStart;
      
      // Rolling 7-day windows
      const last7dStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const prev7dStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const prev7dEnd = last7dStart;
      
      // Rolling 30-day windows
      const last30dStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const prev30dStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const prev30dEnd = last30dStart;

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
        
        if (!auditData || auditData.length === 0) {
          return 0;
        }
        
        const prospectIds = auditData.map(a => a.record_id);
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

      const [last24h, prev24h, last7d, prev7d, last30d, prev30d] = await Promise.all([
        countContactedDomains(last24hStart),
        countContactedDomains(prev24hStart, prev24hEnd),
        countContactedDomains(last7dStart),
        countContactedDomains(prev7dStart, prev7dEnd),
        countContactedDomains(last30dStart),
        countContactedDomains(prev30dStart, prev30dEnd),
      ]);

      setStats({ 
        today: last24h, 
        yesterday: prev24h, 
        thisWeek: last7d, 
        lastWeek: prev7d, 
        thisMonth: last30d, 
        lastMonth: prev30d 
      });
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
            {renderComparisonCard("Last 24h", stats.today, stats.yesterday)}
            {renderComparisonCard("Last 7 Days", stats.thisWeek, stats.lastWeek)}
            {renderComparisonCard("Last 30 Days", stats.thisMonth, stats.lastMonth)}
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
