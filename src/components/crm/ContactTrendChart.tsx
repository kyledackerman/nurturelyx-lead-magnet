import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, parseISO } from "date-fns";

interface TrendData {
  date: string;
  contacted: number;
  domains: number;
}

export const ContactTrendChart = () => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const { data: auditData, error } = await supabase
        .from("audit_logs")
        .select("changed_at, record_id")
        .eq("table_name", "prospect_activities")
        .eq("field_name", "status")
        .eq("new_value", "contacted")
        .gte("changed_at", thirtyDaysAgo)
        .order("changed_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const dateMap = new Map<string, { contacted: Set<string>; count: number }>();

      auditData?.forEach((log) => {
        const date = format(parseISO(log.changed_at), "yyyy-MM-dd");
        if (!dateMap.has(date)) {
          dateMap.set(date, { contacted: new Set(), count: 0 });
        }
        const entry = dateMap.get(date)!;
        entry.contacted.add(log.record_id);
        entry.count++;
      });

      // Fill in missing dates with zeros
      const chartData: TrendData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        const entry = dateMap.get(date);
        chartData.push({
          date: format(parseISO(date), "MMM dd"),
          contacted: entry?.count || 0,
          domains: entry?.contacted.size || 0,
        });
      }

      setData(chartData);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-3">
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          Loading contact trends...
        </div>
      </Card>
    );
  }

  const hasData = data.some((d) => d.contacted > 0 || d.domains > 0);

  if (!hasData) {
    return (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Contact Outreach Trends (Last 30 Days)</h3>
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          No contact activity in the last 30 days
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">Contact Outreach Trends (Last 30 Days)</h3>
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
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="contacted"
            stroke="#81e6d9"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#81e6d9" }}
            name="Contacted"
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="domains"
            stroke="#c084fc"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#c084fc" }}
            name="Unique Domains"
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
