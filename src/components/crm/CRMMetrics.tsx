// Phase 3.1: Using unified CRM metrics hook
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, Flame, AlertCircle } from "lucide-react";
import { CRMMetricsSkeleton } from "./CRMLoadingSkeleton";
import { useCRMMetrics } from "@/hooks/useCRMMetrics";

export default function CRMMetrics() {
  const { metrics, loading } = useCRMMetrics();

  if (loading) {
    return <CRMMetricsSkeleton />;
  }

  if (!metrics) {
    return null;
  }

  const metricCards = [
    {
      title: "Total Prospects",
      value: metrics?.totalProspects || 0,
      icon: Users,
      format: (v: number) => v.toLocaleString()
    },
    {
      title: "Pipeline Value",
      value: metrics?.pipelineValue || 0,
      icon: DollarSign,
      format: (v: number) => `$${(v / 1000).toFixed(1)}k`
    },
    {
      title: "Hot Leads",
      value: metrics?.hotLeads || 0,
      icon: Flame,
      format: (v: number) => v.toLocaleString()
    },
    {
      title: "Overdue Tasks",
      value: metrics?.overdueTasks || 0,
      icon: AlertCircle,
      format: (v: number) => v.toLocaleString()
    }
  ];

  return (
    <div className="flex gap-3">
      {metricCards.map((metric) => (
        <Card key={metric.title} className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.format(metric.value)}</p>
              </div>
              <metric.icon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
