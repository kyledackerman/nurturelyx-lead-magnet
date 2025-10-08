import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, Flame, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsData {
  totalProspects: number;
  pipelineValue: number;
  conversionRate: number;
  hotLeads: number;
  overdueTasks: number;
  dueTodayTasks: number;
}

export default function CRMMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch all prospect activities
      const { data: prospects, error: prospectsError } = await supabase
        .from("prospect_activities")
        .select(`
          *,
          reports!inner(report_data)
        `);

      if (prospectsError) throw prospectsError;

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("prospect_tasks" as any)
        .select("*")
        .eq("status", "pending");

      if (tasksError) throw tasksError;

      // Calculate metrics
      const totalProspects = prospects?.length || 0;
      const pipelineValue = prospects?.reduce((sum, p) => {
        const reportData = p.reports?.report_data as any;
        const revenue = reportData?.monthlyRevenueLost || 0;
        return sum + revenue;
      }, 0) || 0;

      const contactedProspects = prospects?.filter(p => 
        ["contacted", "proposal", "closed_won", "closed_lost"].includes(p.status)
      ).length || 0;
      const closedWon = prospects?.filter(p => p.status === "closed_won").length || 0;
      const conversionRate = contactedProspects > 0 ? (closedWon / contactedProspects) * 100 : 0;

      const hotLeads = prospects?.filter(p => p.priority === "hot").length || 0;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const overdueTasks = tasks?.filter((t: any) => 
        t.due_date && new Date(t.due_date) < today
      ).length || 0;

      const dueTodayTasks = tasks?.filter((t: any) => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate >= today && dueDate < tomorrow;
      }).length || 0;

      setMetrics({
        totalProspects,
        pipelineValue,
        conversionRate,
        hotLeads,
        overdueTasks,
        dueTodayTasks,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex-1">
            <CardContent className="p-4">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
