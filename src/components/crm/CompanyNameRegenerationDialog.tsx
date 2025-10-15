import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegenerationResult {
  updated: Array<{ domain: string; oldName: string; newName: string }>;
  failed: Array<{ domain: string; reason: string }>;
  skipped?: Array<{ domain: string; reason: string }>;
  total: number;
  totalQueried?: number;
  filteredOut?: number;
}

interface CompanyNameRegenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: RegenerationResult | null;
}

export const CompanyNameRegenerationDialog = ({
  open,
  onOpenChange,
  results,
}: CompanyNameRegenerationDialogProps) => {
  if (!results) return null;

  const totalProcessed = results.updated.length + results.failed.length + (results.skipped?.length || 0);

  const handleDownloadFailed = () => {
    const csv = [
      ['Domain', 'Reason'],
      ...results.failed.map(f => [f.domain, f.reason]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-company-names-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Company Name Regeneration Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {results.totalQueried !== undefined && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xl font-bold">{results.totalQueried}</div>
                <div className="text-xs text-muted-foreground">Queried</div>
              </div>
            )}
            {results.filteredOut !== undefined && (
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{results.filteredOut}</div>
                <div className="text-xs text-muted-foreground">Filtered Out</div>
              </div>
            )}
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-success" />
              <div className="text-xl font-bold text-success">{results.updated.length}</div>
              <div className="text-xs text-muted-foreground">Updated</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 mx-auto mb-1 text-destructive" />
              <div className="text-xl font-bold text-destructive">{results.failed.length}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{results.skipped?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>

          {/* Updated Names */}
          {results.updated.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Successfully Updated ({results.updated.length})
              </h3>
              <ScrollArea className="h-48 border rounded-lg p-4">
                <div className="space-y-2">
                  {results.updated.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium">{item.domain}</div>
                      <div className="text-muted-foreground">
                        "{item.oldName}" → "{item.newName}"
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Failed Names */}
          {results.failed.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Failed ({results.failed.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFailed}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-lg p-4">
                <div className="space-y-2">
                  {results.failed.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium text-destructive">{item.domain}</div>
                      <div className="text-muted-foreground text-xs">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Skipped Names */}
          {results.skipped && results.skipped.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                Skipped ({results.skipped.length})
              </h3>
              <ScrollArea className="h-48 border rounded-lg p-4">
                <div className="space-y-2">
                  {results.skipped.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium text-yellow-600 dark:text-yellow-400">{item.domain}</div>
                      <div className="text-muted-foreground text-xs">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
