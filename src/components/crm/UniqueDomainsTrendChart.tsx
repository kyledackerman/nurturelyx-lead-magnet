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
      const { data: chartData, error } = await supabase.rpc('get_daily_unique_domains_enriched', { days: 30 });

      if (error) throw error;

      // Keep raw data for calculations
      const rawDaily = Array.isArray(chartData) ? chartData.map((item: any) => ({
        date: new Date(item.date),
        count: item.count
      })) : [];

      // Format for chart display
      const formattedData = rawDaily.map(item => ({
        date: format(item.date, "MMM dd"),
        count: item.count
      }));

      setData(formattedData);

      // Calculate rolling window stats from the data
      const now = new Date();
      const sumWindow = (days: number, offsetDays: number = 0): number => {
        const endTime = now.getTime() - (offsetDays * 24 * 60 * 60 * 1000);
        const startTime = endTime - (days * 24 * 60 * 60 * 1000);
        return rawDaily
          .filter(item => {
            const itemTime = item.date.getTime();
            return itemTime >= startTime && itemTime < endTime;
          })
          .reduce((sum, item) => sum + item.count, 0);
      };

      const last24h = sumWindow(1, 0);
      const prev24h = sumWindow(1, 1);
      const last7d = sumWindow(7, 0);
      const prev7d = sumWindow(7, 7);
      const last30d = sumWindow(30, 0);
      const prev30d = sumWindow(30, 30);

      setStats({
        today: last24h,
        yesterday: prev24h,
        thisWeek: last7d,
        lastWeek: prev7d,
        thisMonth: last30d,
        lastMonth: prev30d
      });
    } catch (error) {
      console.error("Error fetching unique domains trend:", error);
    } finally {
      setLoading(false);
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
