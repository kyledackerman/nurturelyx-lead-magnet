import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, DollarSign, Target, Flame, AlertCircle, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PipelineChart from "./PipelineChart";
import TeamLeaderboard from "./TeamLeaderboard";

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
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
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
      icon: Target,
      format: (v: number) => v.toString(),
    },
    {
      title: "Pipeline Value",
      value: metrics?.pipelineValue || 0,
      icon: DollarSign,
      format: (v: number) => `$${(v / 1000).toFixed(0)}K`,
    },
    {
      title: "Conversion Rate",
      value: metrics?.conversionRate || 0,
      icon: TrendingUp,
      format: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: "Hot Leads",
      value: metrics?.hotLeads || 0,
      icon: Flame,
      format: (v: number) => v.toString(),
      className: "text-red-500",
    },
    {
      title: "Overdue Tasks",
      value: metrics?.overdueTasks || 0,
      icon: AlertCircle,
      format: (v: number) => v.toString(),
      className: metrics?.overdueTasks ? "text-red-500" : "",
    },
    {
      title: "Due Today",
      value: metrics?.dueTodayTasks || 0,
      icon: Calendar,
      format: (v: number) => v.toString(),
      className: metrics?.dueTodayTasks ? "text-yellow-500" : "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.className || ""}`}>
                  {metric.format(metric.value)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineChart />
        <TeamLeaderboard />
      </div>
    </div>
  );
}
