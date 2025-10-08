import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_COLORS = {
  enriched: "#c084fc",
  review: "#f59e0b",
  contacted: "#81e6d9",
  interested: "#eab308",
  proposal: "#3b82f6",
  closed_won: "#10b981",
  closed_lost: "#6b7280",
  not_viable: "#9ca3af",
};

const STATUS_LABELS = {
  enriched: "Enriched",
  review: "Review",
  contacted: "Contacted",
  interested: "Interested",
  proposal: "Proposal",
  closed_won: "Won",
  closed_lost: "Lost",
  not_viable: "Not Viable",
};

export default function PipelineChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      const { data: prospects, error } = await supabase
        .from("prospect_activities")
        .select(`
          status,
          reports!inner(report_data)
        `);

      if (error) throw error;

      const statusCounts: Record<string, { count: number; value: number }> = {};
      
      prospects?.forEach((p) => {
        if (!statusCounts[p.status]) {
          statusCounts[p.status] = { count: 0, value: 0 };
        }
        statusCounts[p.status].count += 1;
        const reportData = p.reports?.report_data as any;
        statusCounts[p.status].value += reportData?.monthlyRevenueLost || 0;
      });

      const chartData = Object.entries(STATUS_LABELS).map(([status, label]) => ({
        status: label,
        count: statusCounts[status]?.count || 0,
        value: statusCounts[status]?.value || 0,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
      }));

      setData(chartData);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="status" tick={{ fill: 'hsl(var(--foreground))' }} />
            <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--popover-foreground))'
              }}
              labelStyle={{
                color: 'hsl(var(--popover-foreground))',
                fontWeight: 600
              }}
              formatter={(value: number, name: string) => {
                if (name === "count") return value;
                return `$${(value / 1000).toFixed(1)}K`;
              }}
            />
            <Bar dataKey="count" name="Prospects">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
