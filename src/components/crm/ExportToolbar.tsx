import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2, Sparkles } from "lucide-react";

interface ExportToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  autoMarkContacted: boolean;
  onAutoMarkChange: (checked: boolean) => void;
  onExport: () => void;
  onEnrich: () => void;
  onClear: () => void;
  filterSummary?: string;
  exporting?: boolean;
  enriching?: boolean;
}

export default function ExportToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  autoMarkContacted,
  onAutoMarkChange,
  onExport,
  onEnrich,
  onClear,
  filterSummary,
  exporting = false,
  enriching = false,
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
          <Button
            onClick={onEnrich}
            disabled={selectedCount === 0 || enriching || exporting}
            size="sm"
            variant="secondary"
            className="gap-2"
          >
            {enriching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Enrich Contacts
              </>
            )}
          </Button>

          <Button
            onClick={onExport}
            disabled={selectedCount === 0 || exporting || enriching}
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
              disabled={exporting}
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
