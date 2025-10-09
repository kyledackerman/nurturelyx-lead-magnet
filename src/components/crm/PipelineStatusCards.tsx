import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign } from "lucide-react";

const STATUS_COLORS = {
  enriched: "#c084fc",
  review: "#f59e0b",
  contacted: "#81e6d9",
  interested: "#eab308",
  closed_won: "#10b981",
  closed_lost: "#6b7280",
};

const STATUS_LABELS = {
  enriched: "Enriched",
  review: "Review",
  contacted: "Contacted",
  interested: "Interested",
  closed_won: "Won",
  closed_lost: "Lost",
};

interface StatusData {
  status: string;
  count: number;
  value: number;
}

interface PipelineStatusCardsProps {
  onStatusClick?: (status: string) => void;
  activeStatus?: string | null;
}

export default function PipelineStatusCards({ onStatusClick, activeStatus }: PipelineStatusCardsProps) {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    try {
      const { data: activities, error } = await supabase
        .from("prospect_activities")
        .select("status, report_id, reports(report_data)")
        .not("status", "in", '("new","proposal","not_viable","on_hold")');

      if (error) throw error;

      const statusMap: Record<string, { count: number; value: number }> = {};

      // Initialize all 6 statuses
      Object.keys(STATUS_LABELS).forEach((status) => {
        statusMap[status] = { count: 0, value: 0 };
      });

      activities?.forEach((activity: any) => {
        const status = activity.status;
        if (statusMap[status] !== undefined) {
          statusMap[status].count++;
          const reportData = activity.reports?.report_data;
          if (reportData?.transactionValue) {
            statusMap[status].value += parseFloat(reportData.transactionValue);
          }
        }
      });

      const formattedData = Object.entries(statusMap).map(([status, { count, value }]) => ({
        status,
        count,
        value,
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching status data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading pipeline status...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {data.map((item) => {
        const isActive = activeStatus === item.status;
        const color = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS];
        
        return (
          <Card
            key={item.status}
            className={`p-2.5 cursor-pointer transition-all hover:shadow-md ${
              isActive ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onStatusClick?.(item.status)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-sm">
                  {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS]}
                </span>
              </div>
              <span className="text-lg font-bold">{item.count}</span>
            </div>
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <DollarSign className="h-2.5 w-2.5" />
              <span>${(item.value / 1000).toFixed(1)}k</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
