import { useSupportTickets } from "@/hooks/useSupportTickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface MiniTicketPreviewProps {
  clientId: string;
}

export function MiniTicketPreview({ clientId }: MiniTicketPreviewProps) {
  const { data: tickets, isLoading } = useSupportTickets({ clientId });

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      in_progress: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      waiting_client: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
      closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const openTickets = tickets?.filter(t => t.status === 'open') || [];
  const urgentTickets = tickets?.filter(t => t.priority === 'urgent') || [];
  const recentTickets = tickets?.slice(0, 5) || [];

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex gap-3">
        <div className="flex-1 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="text-2xl font-bold text-blue-500">{openTickets.length}</div>
          <div className="text-xs text-muted-foreground">Open Tickets</div>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="text-2xl font-bold text-red-500">{urgentTickets.length}</div>
          <div className="text-xs text-muted-foreground">Urgent</div>
        </div>
      </div>

      {/* Recent Tickets */}
      {recentTickets.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Tickets</h4>
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-medium line-clamp-1">{ticket.subject}</span>
                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No support tickets yet
        </p>
      )}

      {/* View All Button */}
      <Button variant="outline" className="w-full" asChild>
        <a href={`/admin/clients?view=support&client=${clientId}`}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View All Tickets
        </a>
      </Button>
    </div>
  );
}
