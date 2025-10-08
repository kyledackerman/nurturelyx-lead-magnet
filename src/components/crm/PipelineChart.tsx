import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

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

interface PipelineChartProps {
  onStatusClick?: (status: string) => void;
  activeStatus?: string | null;
}

export default function PipelineChart({ onStatusClick, activeStatus }: PipelineChartProps) {
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
        status,
        label,
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const handleBarClick = (data: any) => {
    if (onStatusClick) {
      onStatusClick(data.status);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label"
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-1">{data.label}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Prospects:</span>{" "}
                        <span className="font-medium">{data.count}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Value:</span>{" "}
                        <span className="font-medium">${(data.value / 1000).toFixed(1)}k</span>
                      </p>
                      {onStatusClick && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Click to filter table
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="count" 
              radius={[8, 8, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={activeStatus && activeStatus !== entry.status ? 0.3 : 1}
                  className={cn(
                    "transition-opacity",
                    activeStatus === entry.status && "drop-shadow-lg"
                  )}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
