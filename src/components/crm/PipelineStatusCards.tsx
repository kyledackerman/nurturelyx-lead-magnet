import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase.rpc('get_pipeline_status_domain_counts');

      if (error) throw error;

      // Convert to array format, filtering to only statuses we want to display
      const statusArray: StatusData[] = (data || [])
        .filter((item: any) => STATUS_LABELS[item.status as keyof typeof STATUS_LABELS])
        .map((item: any) => ({
          status: item.status,
          count: item.domain_count,
          value: item.total_value
        }));

      setData(statusArray);
    } catch (error) {
      console.error("Error fetching pipeline status data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading pipeline status...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
      {data.map((item) => {
        const isActive = activeStatus === item.status;
        const color = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS];
        
        return (
          <Card
            key={item.status}
            className={`p-1.5 cursor-pointer transition-all hover:shadow-md ${
              isActive ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onStatusClick?.(item.status)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
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
          </Card>
        );
      })}
    </div>
  );
}
