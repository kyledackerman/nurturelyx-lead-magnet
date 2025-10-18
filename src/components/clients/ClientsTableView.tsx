import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
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
import { Eye } from "lucide-react";
import { useClientAccounts, ClientAccount } from "@/hooks/useClientAccounts";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientsTableViewProps {
  onSelectClient: (clientId: string) => void;
}

export function ClientsTableView({ onSelectClient }: ClientsTableViewProps) {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  
  const { data: clients, isLoading } = useClientAccounts(statusFilter);

  const getStatusBadge = (status: ClientAccount['status']) => {
    const variants = {
      onboarding: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      at_risk: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      churned: 'bg-red-500/10 text-red-500 border-red-500/20',
      paused: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    
    const labels = {
      onboarding: 'Onboarding',
      active: 'Active',
      at_risk: 'At Risk',
      churned: 'Churned',
      paused: 'Paused',
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-500';
    if (score >= 41) return 'text-orange-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No clients found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Health Score</TableHead>
            <TableHead>Contract Value</TableHead>
            <TableHead>Next Renewal</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{client.company_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {client.domain}
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(client.status)}</TableCell>
              <TableCell>
                <span
                  className={`font-semibold ${getHealthScoreColor(
                    client.health_score
                  )}`}
                >
                  {client.health_score}
                </span>
              </TableCell>
              <TableCell>
                {client.contract_value
                  ? `$${client.contract_value.toLocaleString()}`
                  : '—'}
              </TableCell>
              <TableCell>
                {client.next_renewal_date
                  ? new Date(client.next_renewal_date).toLocaleDateString()
                  : '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(client.updated_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectClient(client.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
