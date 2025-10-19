import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExportConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  prospectCount: number;
  domains: string[];
  autoUpdateEnabled: boolean;
  filterSummary?: string;
}

export default function ExportConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  prospectCount,
  domains,
  autoUpdateEnabled,
  filterSummary,
}: ExportConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Export</DialogTitle>
          <DialogDescription>
            You are about to export {prospectCount} prospect{prospectCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {prospectCount > 200 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Large Export</p>
                <p className="text-blue-700 mt-1">
                  This export may take 30-60 seconds to process. Please wait for the download to complete.
                </p>
              </div>
            </div>
          )}

          {filterSummary && (
            <div>
              <p className="text-sm font-medium mb-2">Applied Filters:</p>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                {filterSummary}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Domains:</p>
            <ScrollArea className="h-32 border rounded-md p-2">
              <ul className="text-sm space-y-1">
                {domains.map((domain, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {domain}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          {autoUpdateEnabled && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-900">Status Update Enabled</p>
                <p className="text-orange-700 mt-1">
                  All selected prospects will be automatically marked as "Contacted" after export.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
