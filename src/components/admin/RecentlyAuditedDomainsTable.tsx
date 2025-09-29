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

interface AuditEntry {
  id: string;
  domain: string;
  reportId: string;
  slug: string;
  fieldName: string;
  actionType: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string | null;
  changedAt: string;
}

export const RecentlyAuditedDomainsTable = () => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const { data: auditData, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          record_id,
          table_name,
          field_name,
          action_type,
          old_value,
          new_value,
          changed_by,
          changed_at
        `)
        .eq('table_name', 'reports')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get unique report IDs
      const reportIds = [...new Set(auditData?.map(log => log.record_id) || [])];

      // Fetch report details
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id, domain, slug')
        .in('id', reportIds);

      if (reportsError) throw reportsError;

      // Map report data
      const reportMap = new Map(reports?.map(r => [r.id, r]) || []);

      // Combine data
      const entries: AuditEntry[] = (auditData || [])
        .map(log => {
          const report = reportMap.get(log.record_id);
          if (!report) return null;
          return {
            id: log.id,
            domain: report.domain,
            reportId: report.id,
            slug: report.slug,
            fieldName: log.field_name || 'unknown',
            actionType: log.action_type,
            oldValue: log.old_value,
            newValue: log.new_value,
            changedBy: log.changed_by,
            changedAt: log.changed_at,
          };
        })
        .filter((entry): entry is AuditEntry => entry !== null);

      setAuditEntries(entries);
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast.error('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value: string | null) => {
    if (!value) return '(empty)';
    if (value.length > 50) return value.substring(0, 47) + '...';
    return value;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">📝 Recently Audited Domains</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAuditData}
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
                <TableHead>Field Changed</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading audit data...
                  </TableCell>
                </TableRow>
              ) : auditEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit entries found
                  </TableCell>
                </TableRow>
              ) : (
                auditEntries.map((entry) => (
                  <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{entry.domain}</TableCell>
                    <TableCell>{formatFieldName(entry.fieldName)}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(entry.actionType)}>
                        {entry.actionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-muted-foreground">{formatValue(entry.oldValue)}</span>
                      {' → '}
                      <span className="font-medium">{formatValue(entry.newValue)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.changedBy ? entry.changedBy.substring(0, 8) : 'System'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
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
