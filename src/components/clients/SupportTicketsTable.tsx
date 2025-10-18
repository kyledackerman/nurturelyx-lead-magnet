import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { LifeBuoy, Search } from "lucide-react";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SupportTicketsTableProps {
  onTicketClick: (ticketId: string) => void;
  clientFilter?: string;
}

const statusColors = {
  open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  waiting_client: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const priorityColors = {
  low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const SupportTicketsTable = ({ onTicketClick, clientFilter }: SupportTicketsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { data: tickets, isLoading } = useSupportTickets({
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    clientId: clientFilter,
  });

  const filteredTickets = tickets?.filter((ticket) =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.client_accounts?.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Support Tickets
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_client">Waiting Client</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredTickets || filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No support tickets</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery ? "No tickets match your search." : "Everything running smoothly! 🎉"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-32">Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    ticket.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''
                  }`}
                  onClick={() => onTicketClick(ticket.id)}
                >
                  <TableCell className="font-mono text-xs">
                    #{ticket.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {ticket.client_accounts?.company_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ticket.client_accounts?.domain}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[ticket.status]}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTicketClick(ticket.id);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
