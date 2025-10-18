import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PROSPECT_STATUSES, STATUS_LABELS, normalizeStatus } from "@/lib/crmStatus";

interface ProspectStatusBarProps {
  status: string;
  priority: string;
  assignedTo: string | null;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  isUpdating: boolean;
  admins?: Array<{ id: string; email: string }>;
}

export function ProspectStatusBar({
  status,
  priority,
  assignedTo,
  onStatusChange,
  onPriorityChange,
  isUpdating,
  admins,
}: ProspectStatusBarProps) {
  const normalizedStatus = normalizeStatus(status);

  const priorityColors: Record<string, string> = {
    hot: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    warm: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    cold: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  const assignedAdmin = admins?.find(a => a.id === assignedTo);

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/40">
      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status:</span>
        <Select value={normalizedStatus} onValueChange={onStatusChange} disabled={isUpdating}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROSPECT_STATUSES.map((statusKey) => (
              <SelectItem key={statusKey} value={statusKey}>
                {STATUS_LABELS[statusKey]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Priority:</span>
        <Select value={priority} onValueChange={onPriorityChange} disabled={isUpdating}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hot">🔥 Hot</SelectItem>
            <SelectItem value="warm">☀️ Warm</SelectItem>
            <SelectItem value="cold">❄️ Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {assignedAdmin && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Assigned:</span>
          <Badge variant="outline" className="text-xs">
            {assignedAdmin.email.split('@')[0]}
          </Badge>
        </div>
      )}
    </div>
  );
}
