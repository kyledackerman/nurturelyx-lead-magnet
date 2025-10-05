import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Search, MoreVertical, ExternalLink, Copy, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AssignmentDropdown } from "@/components/admin/AssignmentDropdown";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";

interface ProspectRow {
  id: string;
  domain: string;
  monthlyRevenue: number;
  trafficTier: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  nextFollowUp: string | null;
  reportId: string;
}

interface CRMTableViewProps {
  onSelectProspect: (id: string) => void;
  compact?: boolean;
}

type SortKey = 'domain' | 'monthlyRevenue' | 'trafficTier' | 'priority' | 'status' | 'nextFollowUp';
type SortDirection = 'asc' | 'desc';

export default function CRMTableView({ onSelectProspect, compact = false }: CRMTableViewProps) {
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('nextFollowUp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    fetchProspects();
    
    // Real-time subscription
    const channel = supabase
      .channel('crm-table-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospect_activities'
        },
        () => {
          fetchProspects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          report_id,
          status,
          priority,
          next_follow_up,
          assigned_to,
          reports!inner(
            domain,
            report_data
          )
        `)
        .order("next_follow_up", { ascending: true, nullsFirst: false });

      if (error) throw error;

      const mapped = data?.map((p: any) => ({
        id: p.id,
        reportId: p.report_id,
        domain: p.reports.domain,
        monthlyRevenue: p.reports.report_data?.monthlyRevenueLost || 0,
        trafficTier: getTrafficTier(p.reports.report_data?.organicTraffic || 0),
        priority: p.priority,
        status: p.status,
        assignedTo: p.assigned_to,
        nextFollowUp: p.next_follow_up,
      })) || [];

      setProspects(mapped);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrafficTier = (traffic: number): string => {
    if (traffic < 10000) return "low";
    if (traffic < 100000) return "medium";
    if (traffic < 500000) return "high";
    return "enterprise";
  };

  const isOverdue = (date: string | null): boolean => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isDueToday = (date: string | null): boolean => {
    if (!date) return false;
    const today = new Date();
    const dueDate = new Date(date);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };

  const getRowClassName = (prospect: ProspectRow): string => {
    if (isOverdue(prospect.nextFollowUp)) {
      return "hover:bg-muted/40 border-l-2 border-l-destructive";
    }
    if (isDueToday(prospect.nextFollowUp)) {
      return "hover:bg-muted/40 border-l-2 border-l-accent";
    }
    return "hover:bg-muted/50";
  };

  const getPriorityBadge = (priority: string, isOverdueRow: boolean) => {
    const variants: Record<string, string> = {
      hot: "bg-orange-600 text-white border-orange-400",
      warm: "bg-accent text-black border-accent",
      cold: "bg-gray-600 text-white border-gray-400",
      not_viable: "bg-gray-700 text-gray-300 line-through border-gray-500",
    };
    
    return (
      <Badge variant="outline" className={cn(variants[priority])}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string, isOverdueRow: boolean) => {
    const variants: Record<string, string> = {
      new: "bg-brand-purple text-white border-brand-purple",
      contacted: "bg-accent text-black border-accent",
      proposal: "bg-blue-600 text-white border-blue-400",
      closed_won: "bg-green-600 text-white border-green-400",
      closed_lost: "bg-red-600 text-white border-red-400",
      not_viable: "bg-gray-700 text-gray-300 border-gray-500 line-through",
    };
    
    return (
      <Badge variant="outline" className={cn(variants[status])}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const updatePriority = async (prospectId: string, newPriority: string) => {
    setUpdatingId(prospectId);
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ priority: newPriority })
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Priority updated to ${newPriority}`
      );

      toast.success("Priority updated");
      fetchProspects();
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (prospectId: string, newStatus: string) => {
    setUpdatingId(prospectId);
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ status: newStatus })
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Status updated to ${newStatus}`
      );

      toast.success("Status updated");
      fetchProspects();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    toast.success("Domain copied to clipboard");
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const getTrafficTierValue = (tier: string): number => {
    const values: Record<string, number> = { low: 1, medium: 2, high: 3, enterprise: 4 };
    return values[tier] || 0;
  };

  const getPriorityValue = (priority: string): number => {
    const values: Record<string, number> = { not_viable: 0, cold: 1, warm: 2, hot: 3 };
    return values[priority] || 0;
  };

  const getStatusValue = (status: string): number => {
    const values: Record<string, number> = { 
      new: 1, contacted: 2, proposal: 3, closed_won: 4, closed_lost: 5, not_viable: 6 
    };
    return values[status] || 0;
  };

  const SortableHeader = ({ 
    label, 
    sortKey, 
    className = "" 
  }: { 
    label: string; 
    sortKey: SortKey; 
    className?: string;
  }) => {
    const isActive = sortBy === sortKey;
    return (
      <TableHead 
        className={cn("cursor-pointer select-none hover:bg-muted/50 transition-colors", className)}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          {label}
          <div className="flex flex-col">
            <ChevronUp 
              className={cn(
                "h-3 w-3 -mb-1",
                isActive && sortDirection === 'asc' ? "text-primary" : "text-muted-foreground/30"
              )} 
            />
            <ChevronDown 
              className={cn(
                "h-3 w-3 -mt-1",
                isActive && sortDirection === 'desc' ? "text-primary" : "text-muted-foreground/30"
              )} 
            />
          </div>
        </div>
      </TableHead>
    );
  };

  const filteredProspects = prospects.filter((p) => {
    if (searchTerm && !p.domain.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && p.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== "all" && p.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  const sortedProspects = useMemo(() => {
    const sorted = [...filteredProspects].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'domain':
          aVal = a.domain.toLowerCase();
          bVal = b.domain.toLowerCase();
          break;
        case 'monthlyRevenue':
          aVal = a.monthlyRevenue;
          bVal = b.monthlyRevenue;
          break;
        case 'trafficTier':
          aVal = getTrafficTierValue(a.trafficTier);
          bVal = getTrafficTierValue(b.trafficTier);
          break;
        case 'priority':
          aVal = getPriorityValue(a.priority);
          bVal = getPriorityValue(b.priority);
          break;
        case 'status':
          aVal = getStatusValue(a.status);
          bVal = getStatusValue(b.status);
          break;
        case 'nextFollowUp':
          aVal = a.nextFollowUp ? new Date(a.nextFollowUp).getTime() : Infinity;
          bVal = b.nextFollowUp ? new Date(b.nextFollowUp).getTime() : Infinity;
          break;
        default:
          return 0;
      }

      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredProspects, sortBy, sortDirection]);

  const displayedProspects = compact ? sortedProspects.slice(0, 10) : sortedProspects;

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
              <SelectItem value="not_viable">Not Viable</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
              <SelectItem value="not_viable">Not Viable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="h-12">
              <SortableHeader label="Domain" sortKey="domain" />
              <SortableHeader label="Monthly Revenue" sortKey="monthlyRevenue" className="text-right" />
              {!compact && <SortableHeader label="Traffic" sortKey="trafficTier" />}
              <SortableHeader label="Priority" sortKey="priority" />
              <SortableHeader label="Status" sortKey="status" />
              <TableHead>Assigned To</TableHead>
              <SortableHeader label="Next Follow-Up" sortKey="nextFollowUp" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedProspects.map((prospect) => {
              const overdueRow = isOverdue(prospect.nextFollowUp);
              return (
                <TableRow 
                  key={prospect.id} 
                  className={cn("h-14 even:bg-muted/30", getRowClassName(prospect))}
                >
                  <TableCell className="font-medium">{prospect.domain}</TableCell>
                  <TableCell className={cn("text-right", prospect.monthlyRevenue > 5000 && "font-semibold")}>
                    ${(prospect.monthlyRevenue / 1000).toFixed(1)}K
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      <Badge variant="outline">{prospect.trafficTier}</Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <Select
                      value={prospect.priority}
                      onValueChange={(value) => updatePriority(prospect.id, value)}
                      disabled={updatingId === prospect.id}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="hot">🔥 Hot</SelectItem>
                        <SelectItem value="warm">☀️ Warm</SelectItem>
                        <SelectItem value="cold">❄️ Cold</SelectItem>
                        <SelectItem value="not_viable">❌ Not Viable</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={prospect.status}
                      onValueChange={(value) => updateStatus(prospect.id, value)}
                      disabled={updatingId === prospect.id}
                    >
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                        <SelectItem value="not_viable">Not Viable</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <AssignmentDropdown
                      currentAssignedTo={prospect.assignedTo}
                      reportId={prospect.reportId}
                      onAssignmentChange={() => fetchProspects()}
                      disabled={updatingId === prospect.id}
                    />
                  </TableCell>
                  <TableCell>
                    {prospect.nextFollowUp ? (
                      <span className={overdueRow ? "font-bold text-orange-400" : ""}>
                        {format(new Date(prospect.nextFollowUp), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-50 bg-popover">
                        <DropdownMenuItem onClick={() => onSelectProspect(prospect.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/report/${prospect.reportId}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyDomain(prospect.domain)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Domain
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {displayedProspects.length === 0 && (
              <TableRow>
                <TableCell colSpan={compact ? 7 : 8} className="text-center text-muted-foreground py-8">
                  No prospects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {compact && filteredProspects.length > 10 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing 10 of {filteredProspects.length} prospects. Switch to Table view to see all.
        </p>
      )}
    </div>
  );
}
