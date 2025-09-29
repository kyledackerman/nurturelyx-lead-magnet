import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ActivityEntry {
  id: string;
  domain: string;
  reportId: string;
  slug: string;
  activityType: string;
  status: string;
  priority: string;
  updatedAt: string;
  assignedTo: string | null;
}

export const RecentlyUpdatedDomainsTable = () => {
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prospect_activities')
        .select(`
          id,
          report_id,
          activity_type,
          status,
          priority,
          updated_at,
          assigned_to,
          reports!report_id (
            domain,
            slug
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const entries: ActivityEntry[] = (data || [])
        .filter(activity => activity.reports)
        .map(activity => ({
          id: activity.id,
          domain: (activity.reports as any).domain,
          reportId: activity.report_id,
          slug: (activity.reports as any).slug,
          activityType: activity.activity_type,
          status: activity.status,
          priority: activity.priority,
          updatedAt: activity.updated_at,
          assignedTo: activity.assigned_to,
        }));

      setActivityEntries(entries);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'hot': return 'destructive';
      case 'warm': return 'default';
      case 'cold': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'qualified': return 'default';
      case 'contacted': return 'secondary';
      case 'proposal': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">🎯 Recently Updated Domains</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivityData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading activity data...
                  </TableCell>
                </TableRow>
              ) : activityEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No recent activities found
                  </TableCell>
                </TableRow>
              ) : (
                activityEntries.map((entry) => (
                  <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{entry.domain}</TableCell>
                    <TableCell>{formatActivityType(entry.activityType)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(entry.priority)}>
                        {entry.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.assignedTo ? entry.assignedTo.substring(0, 8) : 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
