import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

export default function CRMTableView({ onSelectProspect, compact = false }: CRMTableViewProps) {
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchProspects();
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
    const isHighValue = prospect.monthlyRevenue > 5000;
    if (isOverdue(prospect.nextFollowUp)) {
      return "bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-600";
    }
    if (isDueToday(prospect.nextFollowUp)) {
      return "bg-accent/5 hover:bg-accent/10 border-l-4 border-l-accent";
    }
    if (isHighValue) {
      return "border-l-4 border-l-orange-600";
    }
    return "hover:bg-muted/50";
  };

  const getPriorityBadge = (priority: string, isOverdueRow: boolean) => {
    const variants: Record<string, string> = {
      hot: "bg-orange-100 text-orange-800 border-orange-300",
      warm: "bg-accent/10 text-accent-foreground border-accent",
      cold: "bg-muted text-muted-foreground border-border",
      not_viable: "bg-gray-400 text-white line-through",
    };
    
    return (
      <Badge variant="outline" className={cn(variants[priority], isOverdueRow && "ring-2 ring-orange-600")}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string, isOverdueRow: boolean) => {
    const variants: Record<string, string> = {
      new: "bg-brand-purple/20 text-brand-purple-dark border-brand-purple",
      contacted: "bg-accent/20 text-accent-foreground border-accent",
      proposal: "bg-blue-100 text-blue-800 border-blue-300",
      closed_won: "bg-green-100 text-green-800 border-green-300",
      closed_lost: "bg-muted text-muted-foreground border-border",
      not_viable: "bg-gray-300 text-gray-700 border-gray-400 line-through",
    };
    
    return (
      <Badge variant="outline" className={cn(variants[status], isOverdueRow && "ring-2 ring-orange-600")}>
        {status.replace("_", " ")}
      </Badge>
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

  const displayedProspects = compact ? filteredProspects.slice(0, 10) : filteredProspects;

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
              <TableHead>Domain</TableHead>
              <TableHead className="text-right">Monthly Revenue</TableHead>
              {!compact && <TableHead>Traffic</TableHead>}
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Follow-Up</TableHead>
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
                  <TableCell className="text-right">
                    ${(prospect.monthlyRevenue / 1000).toFixed(1)}K
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      <Badge variant="outline">{prospect.trafficTier}</Badge>
                    </TableCell>
                  )}
                  <TableCell>{getPriorityBadge(prospect.priority, overdueRow)}</TableCell>
                  <TableCell>{getStatusBadge(prospect.status, overdueRow)}</TableCell>
                  <TableCell>
                    {prospect.nextFollowUp ? (
                      <span className={overdueRow ? "font-bold" : ""}>
                        {format(new Date(prospect.nextFollowUp), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectProspect(prospect.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {displayedProspects.length === 0 && (
              <TableRow>
                <TableCell colSpan={compact ? 6 : 7} className="text-center text-muted-foreground py-8">
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
