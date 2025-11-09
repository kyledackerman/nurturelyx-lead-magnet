import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface ExportRecord {
  id: string;
  exported_at: string;
  export_count: number;
  domains: string[];
  filters_applied: any;
  auto_updated_to_contacted: boolean;
  exported_by: string;
}

interface ExportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportHistoryDialog({ open, onOpenChange }: ExportHistoryDialogProps) {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchExportHistory();
    }
  }, [open]);

  const fetchExportHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prospect_exports')
        .select('id, exported_at, export_count, domains, filters_applied, auto_updated_to_contacted, exported_by')
        .order('exported_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExports(data || []);
    } catch (error) {
      console.error('Error fetching export history:', error);
      toast.error('Failed to load export history');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (exportId: string) => {
    setRegeneratingId(exportId);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-export', {
        body: { exportId }
      });

      if (error) throw error;

      // Download CSV
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prospects_export_regenerated_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Export regenerated successfully');
    } catch (error: any) {
      console.error('Error regenerating export:', error);
      toast.error(error.message || 'Failed to regenerate export');
    } finally {
      setRegeneratingId(null);
    }
  };

  const filteredExports = exports.filter(exp => 
    searchTerm === "" || 
    exp.domains.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDomainsPreview = (domains: string[]) => {
    if (domains.length <= 3) {
      return domains.join(', ');
    }
    return `${domains.slice(0, 3).join(', ')}... and ${domains.length - 3} more`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Export History</DialogTitle>
          <DialogDescription>
            View and re-download past exports (last 50 records)
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredExports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? 'No exports found matching your search.' : 'No exports yet. Select prospects and click Export CSV to create your first export.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Domains</TableHead>
                  <TableHead>Auto-Contacted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExports.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(exp.exported_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{exp.export_count} prospects</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {getDomainsPreview(exp.domains)}
                    </TableCell>
                    <TableCell>
                      {exp.auto_updated_to_contacted ? (
                        <Badge variant="default" className="bg-green-600">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleRegenerate(exp.id)}
                        disabled={regeneratingId === exp.id}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        {regeneratingId === exp.id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3" />
                            Re-download
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
