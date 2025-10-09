import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, parseISO } from "date-fns";

interface TrendData {
  date: string;
  domainsAdded: number;
  contactsAdded: number;
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

      // Fetch domains added (prospect_activities INSERT operations)
      const { data: domainsData, error: domainsError } = await supabase
        .from("audit_logs")
        .select("changed_at, record_id")
        .eq("table_name", "prospect_activities")
        .eq("action_type", "INSERT")
        .gte("changed_at", thirtyDaysAgo)
        .order("changed_at", { ascending: true });

      if (domainsError) throw domainsError;

      // Fetch contacts added (prospect_contacts INSERT operations)
      const { data: contactsData, error: contactsError } = await supabase
        .from("audit_logs")
        .select("changed_at, record_id")
        .eq("table_name", "prospect_contacts")
        .eq("action_type", "INSERT")
        .gte("changed_at", thirtyDaysAgo)
        .order("changed_at", { ascending: true });

      if (contactsError) throw contactsError;

      // Group domains by date
      const domainsMap = new Map<string, Set<string>>();
      domainsData?.forEach((log) => {
        const date = format(parseISO(log.changed_at), "yyyy-MM-dd");
        if (!domainsMap.has(date)) {
          domainsMap.set(date, new Set());
        }
        domainsMap.get(date)!.add(log.record_id);
      });

      // Group contacts by date
      const contactsMap = new Map<string, number>();
      contactsData?.forEach((log) => {
        const date = format(parseISO(log.changed_at), "yyyy-MM-dd");
        contactsMap.set(date, (contactsMap.get(date) || 0) + 1);
      });

      // Fill in missing dates with zeros
      const chartData: TrendData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        chartData.push({
          date: format(parseISO(date), "MMM dd"),
          domainsAdded: domainsMap.get(date)?.size || 0,
          contactsAdded: contactsMap.get(date) || 0,
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

  const hasData = data.some((d) => d.domainsAdded > 0 || d.contactsAdded > 0);

  if (!hasData) {
    return (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Prospects & Contacts Added (Last 30 Days)</h3>
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          No data added in the last 30 days
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">Prospects & Contacts Added (Last 30 Days)</h3>
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
            dataKey="domainsAdded"
            stroke="#81e6d9"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#81e6d9" }}
            name="Domains Added"
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="contactsAdded"
            stroke="#c084fc"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#c084fc" }}
            name="Contacts Added"
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
