import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, parseISO, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Phase 1.2: Generic trend chart component (eliminates ~300 lines of duplicate code)

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

interface TrendChartWithStatsProps {
  title: string;
  tableName: 'prospect_activities' | 'prospect_contacts' | 'prospect_tasks';
  lineColor: string;
  emptyMessage?: string;
}

export default function TrendChartWithStats({ 
  title, 
  tableName, 
  lineColor,
  emptyMessage = "No data in the last 30 days"
}: TrendChartWithStatsProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [stats, setStats] = useState<ComparisonStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tableName]);

  const fetchData = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Special handling for prospect_contacts - query directly with email filter
      if (tableName === 'prospect_contacts') {
        const { data: contactsData, error } = await supabase
          .from("prospect_contacts")
          .select("id, created_at")
          .not('email', 'is', null)
          .neq('email', '')
          .gte("created_at", thirtyDaysAgo)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Group by local date
        const recordsMap = new Map<string, number>();
        contactsData?.forEach((contact) => {
          const localDate = format(parseISO(contact.created_at), "yyyy-MM-dd");
          recordsMap.set(localDate, (recordsMap.get(localDate) || 0) + 1);
        });

        // Fill in missing dates with zeros
        const chartData: TrendData[] = [];
        for (let i = 29; i >= 0; i--) {
          const dateObj = subDays(new Date(), i);
          const dateKey = format(dateObj, "yyyy-MM-dd");
          chartData.push({
            date: format(dateObj, "MMM dd"),
            count: recordsMap.get(dateKey) || 0,
          });
        }

        setData(chartData);
        await fetchComparisonStats();
      } else {
        // Use audit_logs for other tables
        const { data: logsData, error } = await supabase
          .from("audit_logs")
          .select("changed_at, record_id")
          .eq("table_name", tableName)
          .eq("action_type", "INSERT")
          .gte("changed_at", thirtyDaysAgo)
          .order("changed_at", { ascending: true });

        if (error) throw error;

        // Group by local date
        const recordsMap = new Map<string, Set<string>>();
        logsData?.forEach((log) => {
          const localDate = format(parseISO(log.changed_at), "yyyy-MM-dd");
          if (!recordsMap.has(localDate)) {
            recordsMap.set(localDate, new Set());
          }
          recordsMap.get(localDate)!.add(log.record_id);
        });

        // Fill in missing dates with zeros
        const chartData: TrendData[] = [];
        for (let i = 29; i >= 0; i--) {
          const dateObj = subDays(new Date(), i);
          const dateKey = format(dateObj, "yyyy-MM-dd");
          chartData.push({
            date: format(dateObj, "MMM dd"),
            count: recordsMap.get(dateKey)?.size || 0,
          });
        }

        setData(chartData);
        await fetchComparisonStats();
      }
    } catch (error) {
      console.error(`Error fetching ${tableName} trend data:`, error);
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

      // Special handling for prospect_contacts - count only with emails
      if (tableName === 'prospect_contacts') {
        const countPeriod = async (start: string, end?: string) => {
          let query = supabase
            .from("prospect_contacts")
            .select("id", { count: 'exact', head: true })
            .not('email', 'is', null)
            .neq('email', '')
            .gte("created_at", start);
          
          if (end) {
            query = query.lt("created_at", end);
          }
          
          const { count } = await query;
          return count || 0;
        };

        const [today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
          countPeriod(todayStart),
          countPeriod(yesterdayStart, yesterdayEnd),
          countPeriod(thisWeekStart),
          countPeriod(lastWeekStart, lastWeekEnd),
          countPeriod(thisMonthStart),
          countPeriod(lastMonthStart, lastMonthEnd),
        ]);

        setStats({ today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth });
      } else {
        // Use audit_logs for other tables
        const fetchPeriod = async (start: string, end?: string) => {
          let query = supabase
            .from("audit_logs")
            .select("record_id")
            .eq("table_name", tableName)
            .eq("action_type", "INSERT")
            .gte("changed_at", start);
          
          if (end) {
            query = query.lt("changed_at", end);
          }
          
          const { data } = await query;
          return new Set(data?.map(d => d.record_id) || []).size;
        };

        const [today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
          fetchPeriod(todayStart),
          fetchPeriod(yesterdayStart, yesterdayEnd),
          fetchPeriod(thisWeekStart),
          fetchPeriod(lastWeekStart, lastWeekEnd),
          fetchPeriod(thisMonthStart),
          fetchPeriod(lastMonthStart, lastMonthEnd),
        ]);

        setStats({ today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth });
      }
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
          Loading {title.toLowerCase()}...
        </div>
      </Card>
    );
  }

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">{title}</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          {emptyMessage}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      
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
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 3, fill: lineColor }}
            name="Count"
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
