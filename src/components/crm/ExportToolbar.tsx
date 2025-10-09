import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2, Target, CheckCircle, XCircle, AlertCircle, MessageSquare, FileCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface ExportToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  autoMarkContacted: boolean;
  onAutoMarkChange: (checked: boolean) => void;
  onExport: () => void;
  onClear: () => void;
  filterSummary?: string;
  exporting?: boolean;
  onBulkStatusUpdate: (newStatus: string) => void;
  updatingStatus?: boolean;
}

export default function ExportToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  autoMarkContacted,
  onAutoMarkChange,
  onExport,
  onClear,
  filterSummary,
  exporting = false,
  onBulkStatusUpdate,
  updatingStatus = false,
}: ExportToolbarProps) {
  return (
    <div className="bg-card border rounded-lg p-4 mb-4 sticky top-0 z-10 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={onSelectAll}
            disabled={exporting}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            Select All
          </label>
        </div>

        <div className="text-sm font-medium">
          {selectedCount} of {totalCount} selected
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="auto-mark"
            checked={autoMarkContacted}
            onCheckedChange={onAutoMarkChange}
            disabled={exporting}
          />
          <label htmlFor="auto-mark" className="text-sm cursor-pointer">
            Mark as Contacted after export
          </label>
        </div>

        <div className="flex gap-2 ml-auto">
          {selectedCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={updatingStatus || exporting}
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Bulk Actions
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('enriched')}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Mark as Enriched
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('contacted')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mark as Contacted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('proposal')}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Mark as Proposal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('closed_won')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Mark as Closed Won
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('closed_lost')}>
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  Mark as Closed Lost
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusUpdate('not_viable')}>
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                  Mark as Not Viable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            onClick={onExport}
            disabled={selectedCount === 0 || exporting || updatingStatus}
            size="sm"
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>

          {selectedCount > 0 && (
            <Button
              onClick={onClear}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={exporting || updatingStatus}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {filterSummary && (
        <div className="mt-2 text-xs text-muted-foreground">
          Active filters: {filterSummary}
        </div>
      )}
    </div>
  );
}
