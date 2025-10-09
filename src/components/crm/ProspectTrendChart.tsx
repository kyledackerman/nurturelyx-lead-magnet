import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, parseISO, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
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

export const ProspectTrendChart = () => {
  const [data, setData] = useState<TrendData[]>([]);
  const [stats, setStats] = useState<ComparisonStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Fetch all prospect_activities INSERT operations for the last 30 days
      const { data: domainsData, error } = await supabase
        .from("audit_logs")
        .select("changed_at, record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", thirtyDaysAgo)
        .order("changed_at", { ascending: true });

      if (error) throw error;

      // Group domains by date
      const domainsMap = new Map<string, Set<string>>();
      domainsData?.forEach((log) => {
        const date = format(parseISO(log.changed_at), "yyyy-MM-dd");
        if (!domainsMap.has(date)) {
          domainsMap.set(date, new Set());
        }
        domainsMap.get(date)!.add(log.record_id);
      });

      // Fill in missing dates with zeros
      const chartData: TrendData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        chartData.push({
          date: format(parseISO(date), "MMM dd"),
          count: domainsMap.get(date)?.size || 0,
        });
      }

      setData(chartData);

      // Calculate comparison stats
      await fetchComparisonStats();
    } catch (error) {
      console.error("Error fetching prospect trend data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonStats = async () => {
    try {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const yesterdayStart = startOfDay(subDays(now, 1)).toISOString();
      const yesterdayEnd = startOfDay(now).toISOString();
      
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString();
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString();
      
      const thisMonthStart = startOfMonth(now).toISOString();
      const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
      const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

      // Fetch today's count
      const { data: todayData } = await supabase
        .from("audit_logs")
        .select("record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", todayStart);

      // Fetch yesterday's count
      const { data: yesterdayData } = await supabase
        .from("audit_logs")
        .select("record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", yesterdayStart)
        .lt("changed_at", yesterdayEnd);

      // Fetch this week's count
      const { data: thisWeekData } = await supabase
        .from("audit_logs")
        .select("record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", thisWeekStart);

      // Fetch last week's count
      const { data: lastWeekData } = await supabase
        .from("audit_logs")
        .select("record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", lastWeekStart)
        .lte("changed_at", lastWeekEnd);

      // Fetch this month's count
      const { data: thisMonthData } = await supabase
        .from("audit_logs")
        .select("record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", thisMonthStart);

      // Fetch last month's count
      const { data: lastMonthData } = await supabase
        .from("audit_logs")
        .select("record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", lastMonthStart)
        .lte("changed_at", lastMonthEnd);

      // Count unique record_ids
      const today = new Set(todayData?.map(d => d.record_id) || []).size;
      const yesterday = new Set(yesterdayData?.map(d => d.record_id) || []).size;
      const thisWeek = new Set(thisWeekData?.map(d => d.record_id) || []).size;
      const lastWeek = new Set(lastWeekData?.map(d => d.record_id) || []).size;
      const thisMonth = new Set(thisMonthData?.map(d => d.record_id) || []).size;
      const lastMonth = new Set(lastMonthData?.map(d => d.record_id) || []).size;

      setStats({ today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth });
    } catch (error) {
      console.error("Error fetching comparison stats:", error);
    }
  };

  const renderComparisonCard = (current: number, previous: number, label: string) => {
    const diff = current - previous;
    const percentChange = previous > 0 ? ((diff / previous) * 100).toFixed(0) : "0";
    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    return (
      <Card className="p-3 flex flex-col items-center justify-center">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold">{current}</span>
          <span className="text-xs text-muted-foreground">vs</span>
          <span className="text-lg text-muted-foreground">{previous}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          isNeutral ? "text-muted-foreground" : isPositive ? "text-green-600" : "text-red-600"
        }`}>
          {isNeutral ? (
            <Minus className="w-3 h-3" />
          ) : isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? "+" : ""}{diff} ({isPositive ? "+" : ""}{percentChange}%)</span>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          Loading prospect trends...
        </div>
      </Card>
    );
  }

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Prospects Added (Last 30 Days)</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          No prospects added in the last 30 days
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Prospects Added (Last 30 Days)</h3>
      
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {renderComparisonCard(stats.today, stats.yesterday, "Today vs Yesterday")}
          {renderComparisonCard(stats.thisWeek, stats.lastWeek, "This Week vs Last")}
          {renderComparisonCard(stats.thisMonth, stats.lastMonth, "This Month vs Last")}
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "11px" }}
            tickMargin={8}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "11px" }}
            tickMargin={8}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              padding: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontSize: "12px", fontWeight: 600 }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#81e6d9"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#81e6d9" }}
            name="Prospects Added"
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
